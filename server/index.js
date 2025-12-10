require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Twilio = require('twilio');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Enhanced rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'too_many_requests',
    message: 'تم تجاوز عدد محاولات الطلب. يرجى المحاولة لاحقًا.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'too_many_requests',
    message: 'تم تجاوز عدد محاولات الطلب. يرجى المحاولة لاحقًا.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', globalLimiter);

// إنشاء عميل Twilio فقط إذا كانت بيانات الاعتماد موجودة
const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const ADMIN_USER = process.env.ADMIN_USER || 'owner';
const ADMIN_HASH = process.env.ADMIN_HASH || '';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_t_rex_shop_production';

// Enhanced OTP storage with cleanup
const otps = new Map();

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, otpData] of otps.entries()) {
    if (now > otpData.expiresAt) {
      otps.delete(phone);
      console.log(`[CLEANUP] Expired OTP removed for ${phone}`);
    }
  }
}, 60 * 1000); // Every minute

function genOTP(){ 
  return ('000000' + Math.floor(Math.random()*1000000)).slice(-6); 
}

// Enhanced phone validation
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's a valid Yemeni phone number (starts with 7 and has 9 digits)
  return /^7[0-9]{7}$/.test(cleanPhone);
}

app.post('/api/auth/request-otp', async (req,res)=>{
  try {
    const { username, password, phone, via } = req.body;
    
    // Validation
    if (!username || !password || !phone) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
    }
    
    if (username !== ADMIN_USER) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'اسم المستخدم غير صحيح'
      });
    }
    
    // Validate phone number format
    if (!validatePhone(phone)) {
      return res.status(400).json({
        error: 'invalid_phone',
        message: 'رقم الهاتف غير صحيح. يرجى إدخال رقم يمني صحيح يبدأ بـ 7'
      });
    }
    
    const ok = await bcrypt.compare(password, ADMIN_HASH);
    if (!ok) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'كلمة المرور غير صحيحة'
      });
    }
    
    const code = genOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otps.set(phone, { code, expiresAt, attempts: 0 });
    
    const body = `رمز التحقق من متجر T-REX: ${code}`;
    
    // Log OTP in development mode
    if (process.env.NODE_ENV === 'development' || !twilioClient) {
      console.log(`[DEV MODE] OTP for ${phone}: ${code}`);
      return res.json({
        ok: true, 
        devMode: true, 
        code: code,
        message: 'تم إنشاء رمز التحقق بنجاح'
      });
    }
    
    try {
      // Send via preferred method
      if (via === 'whatsapp' || via === 'both') {
        await twilioClient.messages.create({ 
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, 
          to: `whatsapp:${phone}`, 
          body 
        });
      }
      
      if (via === 'sms' || via === 'both' || !via) {
        await twilioClient.messages.create({ 
          from: process.env.TWILIO_PHONE_NUMBER, 
          to: phone, 
          body 
        });
      }
      
      return res.json({
        ok: true,
        message: 'تم إرسال رمز التحقق إلى رقمك'
      });
    } catch(e) {
      console.error('Twilio send error', e);
      return res.status(500).json({
        error: 'send_failed',
        message: 'فشل في إرسال رمز التحقق. يرجى المحاولة لاحقًا'
      });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    return res.status(500).json({
      error: 'internal_error',
      message: 'حدث خطأ داخلي في الخادم'
    });
  }
});

app.post('/api/auth/verify-otp', (req,res)=>{
  try {
    const { phone, code } = req.body;
    
    // Validation
    if (!phone || !code) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
    }
    
    const rec = otps.get(phone);
    if (!rec) {
      return res.status(400).json({
        error: 'no_otp',
        message: 'لم يتم طلب رمز التحقق لهذا الرقم'
      });
    }
    
    // Check expiration
    if (Date.now() > rec.expiresAt) {
      otps.delete(phone);
      return res.status(400).json({
        error: 'expired',
        message: 'انتهت صلاحية رمز التحقق'
      });
    }
    
    // Check attempts
    rec.attempts = (rec.attempts || 0) + 1;
    if (rec.attempts > 3) {
      otps.delete(phone);
      return res.status(400).json({
        error: 'too_many_attempts',
        message: 'تم تجاوز عدد محاولات التحقق'
      });
    }
    
    // Verify code
    if (rec.code !== code) {
      return res.status(401).json({
        error: 'wrong',
        message: 'رمز التحقق غير صحيح'
      });
    }
    
    // Success - remove OTP and generate token
    otps.delete(phone);
    const token = jwt.sign(
      { role: 'admin', sub: ADMIN_USER }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    return res.json({ 
      token,
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      error: 'internal_error',
      message: 'حدث خطأ داخلي في الخادم'
    });
  }
});

app.get('/api/auth/check', (req,res)=>{
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({
        ok: false,
        message: 'غير مصرح'
      });
    }
    
    const token = auth.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'رمز الوصول مفقود'
      });
    }
    
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.json({ 
        ok: true, 
        user: payload.sub, 
        role: payload.role,
        message: 'الرمز صالح'
      });
    } catch(e) {
      return res.status(401).json({
        ok: false,
        message: 'رمز الوصول غير صالح أو منتهي الصلاحية'
      });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    return res.status(500).json({
      error: 'internal_error',
      message: 'حدث خطأ داخلي في الخادم'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 T-REX Auth Server listening on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 OTP endpoint: http://localhost:${PORT}/api/auth/request-otp`);
  console.log(`✅ Verify endpoint: http://localhost:${PORT}/api/auth/verify-otp`);
});
