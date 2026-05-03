require('dotenv').config();
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const Twilio = require('twilio');
const fileUpload = require('express-fileupload');
const { body, validationResult } = require('express-validator');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const csrf = require('csurf');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// CORS Configuration - تقييد النطاقات المسموحة
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:19006'];
app.use(cors({
  origin: function(origin, callback) {
    // السماح بـ requests بدون origin (مثل التطبيقات المحمولة)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(xss()); // حماية من XSS
app.use(mongoSanitize()); // حماية من NoSQL Injection

// CSRF Protection - معطل للتطبيق المحمول
// ملاحظة: CSRF Protection غير ضروري لتطبيقات الموبايل لأن:
// 1. التطبيق يستخدم JWT tokens في Authorization header بدلاً من cookies
// 2. تطبيقات الموبايل لا تعاني من هجمات CSRF مثل تطبيقات الويب
// 3. JWT tokens أكثر أماناً وسهولة في الاستخدام لتطبيقات الموبايل
// إذا تم إضافة واجهة ويب في المستقبل، يمكن تفعيل CSRF Protection للطلبات من الويب فقط

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  createParentPath: true
}));

// إنشاء مجلد للصور إذا لم يكن موجوداً
const uploadsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد رفع الصور:', uploadsDir);
}

// خدمة الملفات الثابتة للصور
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware للتحقق من صحة البيانات
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: 'validation_error',
      message: errors.array()[0].msg
    });
  };
};

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
let twilioClient = null;
try {
  if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SID.startsWith('AC')) {
    twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized');
  } else {
    console.log('⚠️  Twilio not configured - OTP will be logged to console');
  }
} catch (error) {
  console.log('⚠️  Twilio not available - OTP will be logged to console');
}

const ADMIN_USER = process.env.ADMIN_USER || 'owner';
const ADMIN_HASH = process.env.ADMIN_HASH || '';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is required. Please set it in your environment variables.');
  process.exit(1);
}

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

function verifyAdminToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'رمز الوصول مفقود'
    });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({
        error: 'forbidden',
        message: 'غير مصرح لك بهذا الإجراء'
      });
    }

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'رمز الوصول غير صالح أو منتهي الصلاحية'
    });
  }
}

function safeImageFilename(inputName) {
  const fallbackName = `product_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
  if (!inputName || typeof inputName !== 'string') return fallbackName;

  const parsedExt = path.extname(inputName).toLowerCase();
  const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  const safeExt = allowedExts.has(parsedExt) ? parsedExt : '.jpg';
  const baseName = path.basename(inputName, path.extname(inputName));
  const normalizedBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || `product_${Date.now()}`;
  return `${normalizedBase}${safeExt}`;
}

// Enhanced phone validation
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's a valid Yemeni phone number (starts with 7 and has 9 digits)
  return /^7[0-9]{7}$/.test(cleanPhone);
}

app.post('/api/auth/request-otp', 
  validate([
    body('username')
      .trim()
      .notEmpty().withMessage('اسم المستخدم مطلوب')
      .isLength({ min: 3, max: 50 }).withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف'),
    body('password')
      .notEmpty().withMessage('كلمة المرور مطلوبة')
      .isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    body('phone')
      .trim()
      .notEmpty().withMessage('رقم الهاتف مطلوب')
      .matches(/^7[0-9]{8}$/).withMessage('رقم الهاتف يجب أن يكون يمني صحيح يبدأ بـ 7')
  ]),
  async (req,res)=>{
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
    
    // Log OTP in development mode ONLY - لا ترسل الكود في الرد أبداً
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n✅ [DEV MODE] OTP for ${phone}: ${code}`);
      console.log(`⏰ Expires at: ${new Date(expiresAt).toISOString()}\n`);
      return res.json({
        ok: true, 
        devMode: true,
        message: 'تم إنشاء رمز التحقق بنجاح. راجع console في السيرفر'
      });
    }
    
    // Production mode - إرسال عبر Twilio فقط
    if (!twilioClient) {
      console.error('Twilio credentials not configured. Please set TWILIO_SID and TWILIO_AUTH_TOKEN in .env');
      return res.status(500).json({
        error: 'sms_service_not_configured',
        message: 'خدمة الرسائل غير مهيأة. يرجى الاتصال بالمسؤول'
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

app.post('/api/auth/verify-otp', 
  validate([
    body('phone')
      .trim()
      .notEmpty().withMessage('رقم الهاتف مطلوب')
      .matches(/^7[0-9]{8}$/).withMessage('رقم الهاتف غير صحيح'),
    body('code')
      .trim()
      .notEmpty().withMessage('رمز التحقق مطلوب')
      .isLength({ min: 6, max: 6 }).withMessage('رمز التحقق يجب أن يكون 6 أرقام')
  ]),
  (req,res)=>{
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

// رفع الصور
app.post('/api/upload/image', verifyAdminToken, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        error: 'no_file',
        message: 'لم يتم إرسال صورة'
      });
    }

    const image = req.files.image;
    if (!image.mimetype || !image.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: 'invalid_file_type',
        message: 'نوع الملف غير مدعوم. يرجى رفع صورة فقط'
      });
    }

    const filename = safeImageFilename(image.name);
    const filepath = path.join(uploadsDir, filename);

    // حفظ الملف
    await image.mv(filepath);

    // إرجاع رابط الصورة
    const imageUrl = `http://${req.get('host')}/uploads/products/${filename}`;
    
    console.log(`✅ تم رفع الصورة: ${filename}`);
    
    return res.json({
      success: true,
      url: imageUrl,
      filename: filename,
      message: 'تم رفع الصورة بنجاح'
    });
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    return res.status(500).json({
      error: 'upload_failed',
      message: 'فشل في رفع الصورة'
    });
  }
});

// رفع الصور من base64
app.post('/api/upload/image-base64', verifyAdminToken, async (req, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({
        error: 'no_data',
        message: 'لم يتم إرسال بيانات الصورة'
      });
    }

    // استخراج base64 من data URL إذا كان موجوداً
    let base64Data = imageData;
    if (imageData.includes(',')) {
      base64Data = imageData.split(',')[1];
    }

    const finalFilename = safeImageFilename(filename);
    const filepath = path.join(uploadsDir, finalFilename);

    // تحويل base64 إلى buffer وحفظه
    const buffer = Buffer.from(base64Data, 'base64');
    const maxBytes = 10 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return res.status(400).json({
        error: 'file_too_large',
        message: 'حجم الصورة يتجاوز الحد المسموح (10MB)'
      });
    }
    fs.writeFileSync(filepath, buffer);

    // إرجاع رابط الصورة
    const imageUrl = `http://${req.get('host')}/uploads/products/${finalFilename}`;
    
    console.log(`✅ تم رفع الصورة من base64: ${finalFilename}`);
    
    return res.json({
      success: true,
      url: imageUrl,
      filename: finalFilename,
      message: 'تم رفع الصورة بنجاح'
    });
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة من base64:', error);
    return res.status(500).json({
      error: 'upload_failed',
      message: 'فشل في رفع الصورة'
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

// Admin Login Endpoint - تسجيل دخول المدير
app.post('/api/auth/admin-login', 
  validate([
    body('email')
      .trim()
      .notEmpty().withMessage('البريد الإلكتروني مطلوب')
      .isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password')
      .notEmpty().withMessage('كلمة المرور مطلوبة')
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Admin Login Attempt:');
      console.log('  - Provided Email:', email);
      console.log('  - Provided Password:', password);
      
      // التحقق من أن البريد هو بريد المدير
      const adminEmail = process.env.ADMIN_EMAIL;
      console.log('  - Expected Email:', adminEmail);
      
      if (!adminEmail) {
        console.error('❌ ADMIN_EMAIL not configured in environment variables');
        return res.status(500).json({
          error: 'server_error',
          message: 'خطأ في إعدادات السيرفر'
        });
      }
      if (email !== adminEmail) {
        console.log('❌ Email mismatch');
        return res.status(401).json({
          error: 'unauthorized',
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
      }
      
      // التحقق من كلمة المرور
      const adminHash = process.env.ADMIN_HASH;
      console.log('  - Hash Length:', adminHash ? adminHash.length : 'N/A');
      
      if (!adminHash) {
        console.error('❌ ADMIN_HASH not configured in environment variables');
        return res.status(500).json({
          error: 'server_error',
          message: 'خطأ في إعدادات السيرفر'
        });
      }
      
      const passwordMatch = await bcrypt.compare(password, adminHash);
      console.log('  - Password Match:', passwordMatch);
      
      if (!passwordMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({
          error: 'unauthorized',
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
      }
      
      // إنشاء JWT token
      const token = jwt.sign(
        { 
          role: 'admin', 
          email: email,
          sub: process.env.ADMIN_USER || 'owner' 
        }, 
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      // تسجيل محاولة الدخول الناجحة
      console.log(`✅ Admin login successful: ${email} at ${new Date().toISOString()}`);
      
      return res.json({
        token,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          email: email,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({
        error: 'internal_error',
        message: 'حدث خطأ داخلي في الخادم'
      });
    }
  }
);

const PORT = process.env.PORT || 4001;
const HTTPS_PORT = process.env.HTTPS_PORT || 4433;

// إعداد HTTPS للإنتاج أو التنمية
if (process.env.NODE_ENV === 'production') {
  // في الإنتاج، استخدم شهادات SSL حقيقية (مثل Let's Encrypt)
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca_bundle.crt'))
  };
  
  https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`� T-REX Auth Server (HTTPS) listening on port ${HTTPS_PORT}`);
  });
  
  // إعادة توجيه HTTP إلى HTTPS
  http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  }).listen(80, '0.0.0.0', () => {
    console.log(`🔄 HTTP to HTTPS redirect listening on port 80`);
  });
} else {
  // في التنمية، استخدم HTTP فقط (أو self-signed certificate إذا كان متوفراً)
  console.log(`⚠️  Development mode: Using HTTP only (not recommended for production)`);
  console.log(`💡 To enable HTTPS in development, generate self-signed certificates`);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔐 T-REX Auth Server (HTTP) listening on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📱 OTP endpoint: http://localhost:${PORT}/api/auth/request-otp`);
    console.log(`✅ Verify endpoint: http://localhost:${PORT}/api/auth/verify-otp`);
    console.log(`📤 Upload image: http://localhost:${PORT}/api/upload/image`);
    console.log(`📤 Upload image (base64): http://localhost:${PORT}/api/upload/image-base64`);
  });
}
