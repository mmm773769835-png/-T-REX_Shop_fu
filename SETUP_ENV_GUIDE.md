# 🔐 إعداد Environment Variables - T-REX Shop

## 📋 الخطوات المطلوبة

### الخطوة 1: إنشاء ملف .env

```bash
cd server
cp .env.example .env
```

### الخطوة 2: إنشاء Hash لكلمة مرور المدير

#### الطريقة 1: استخدام السكريبت الموجود
```bash
node create-hash.js
```

أدخل كلمة المرور التي تريدها (مثلاً: `Admin@123456`)
انسخ الهاش الناتج وضعه في ملف `.env`

#### الطريقة 2: استخدام Node.js مباشرة
```bash
node
```

ثم في الـ REPL:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('كلمة_المرور_الجديدة', 10).then(hash => {
  console.log('ADMIN_HASH=' + hash);
});
```

انسخ النتيجة وضعها في `.env`

### الخطوة 3: تحرير ملف .env

افتح ملف `server/.env` وأضف/حدّث القيم التالية:

```env
# ========================================
# إعدادات مدير النظام
# ========================================
ADMIN_USER=owner

# ضع هنا الهاش من الخطوة 2
ADMIN_HASH=$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# بريد المدير الإلكتروني
ADMIN_EMAIL=admin@t-rex-shop.com

# ========================================
# إعدادات JWT
# ========================================
# استخدم سلسلة عشوائية قوية (32 حرف على الأقل)
# يمكنك استخدام: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_random_string_min_32_characters_here

# ========================================
# إعدادات Twilio للرسائل SMS/WhatsApp
# ========================================
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890

# ========================================
# إعدادات السيرفر
# ========================================
PORT=4001

# development أو production
NODE_ENV=development

# ========================================
# إعدادات CORS
# ========================================
# النطاقات المسموح بها (للتطبيق веб فقط)
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:19002

# ========================================
# إعدادات الأمان
# ========================================
# عدد جولات bcrypt (كلما زاد زادت الأمان ولكن أبطأ)
BCRYPT_ROUNDS=10
```

### الخطوة 4: اختبار الإعدادات

#### اختبار تشفير كلمة المرور
```bash
node test-admin-panel.js
```

#### اختبار الاتصال
```bash
npm start
```

ثم افتح متصفح واذهب إلى:
```
http://localhost:4001/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2026-03-25T...",
  "uptime": 0.123
}
```

---

## 🔍 التحقق من صحة الإعدادات

### Checklist ✅

- [ ] ملف `.env` موجود في مجلد `server`
- [ ] `ADMIN_HASH` يحتوي على bcrypt hash صحيح
- [ ] `ADMIN_EMAIL` يحتوي على بريد صحيح
- [ ] `JWT_SECRET` لا يقل عن 32 حرف
- [ ] `NODE_ENV` مضبوط على `development` حالياً
- [ ] المنفذ `PORT` مطابق للكود (4001)

### اختبار تسجيل الدخول

بعد تشغيل السيرفر، اختبر تسجيل الدخول:

```bash
curl -X POST http://localhost:4001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@t-rex-shop.com",
    "password": "كلمة_المرور_التي_وضعتها"
  }'
```

النتيجة المتوقعة:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "email": "admin@t-rex-shop.com",
    "role": "admin"
  }
}
```

---

## ⚠️ مشاكل شائعة وحلولها

### المشكلة 1: "ADMIN_HASH not configured"
**السبب:** لم تضع الهاش في `.env`  
**الحل:** تأكد من وجود السطر:
```env
ADMIN_HASH=$2b$10$...
```

### المشكلة 2: "Invalid token" أو "JWT malformed"
**السبب:** `JWT_SECRET` فارغ أو قصير جداً  
**الحل:** استخدم سلسلة عشوائية طويلة:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### المشكلة 3: "Cannot find module 'bcrypt'"
**السبب:** المكتبات غير مثبتة  
**الحل:**
```bash
cd server
npm install
```

### المشكلة 4: CORS Error
**السبب:** النطاق غير مسموح  
**الحل:** أضف النطاق الصحيح إلى `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:19002,exp://192.168.x.x:19000
```

---

## 🔒 نصائح أمنية

### للبيئة التطويرية (Development)
```env
NODE_ENV=development
JWT_SECRET=dev_secret_change_in_production
BCRYPT_ROUNDS=10  # أسرع للتطوير
```

### للبيئة الإنتاجية (Production)
```env
NODE_ENV=production
JWT_SECRET=<strong_random_64_chars>
BCRYPT_ROUNDS=12  # أكثر أماناً
ALLOWED_ORIGINS=https://yourdomain.com
```

### حماية ملف .env
```bash
# تأكد من أن .env في .gitignore
echo ".env" >> .gitignore

# تحقق من عدم وجود .env في git
git ls-files | grep .env
# يجب أن يكون الناتج فارغ
```

---

## 📝 ملاحظات مهمة

### ⚠️ تحذيرات
1. **لا تشارك ملف .env أبداً**
2. **لا ترفع .env إلى Git**
3. **استخدم قيم مختلفة لكل بيئة**
4. **بدّل JWT_SECRET كل 3 أشهر**

### 💡 أفضل الممارسات
1. **استخدم كلمات مرور قوية** (12+ حرف، أحرف كبيرة، أرقام، رموز)
2. **احتفظ بنسخة احتياطية آمنة من .env**
3. **وثّق جميع المتغيرات**
4. **اختبر في development أولاً**

---

## 🆘 الحصول على المساعدة

إذا واجهت مشكلة:

1. **تحقق من logs:**
   ```bash
   npm start
   # راقب الأخطاء
   ```

2. **اختبر كل متغير:**
   ```javascript
   console.log('ADMIN_HASH:', process.env.ADMIN_HASH ? '✅' : '❌');
   console.log('JWT_SECRET:', process.env.JWT_SECRET?.length >= 32 ? '✅' : '❌');
   ```

3. **راجع الملفات:**
   - `server/.env.example` - المثال
   - `SECURITY_IMPROVEMENTS.md` - التوثيق الكامل

---

**آخر تحديث:** 2026-03-25  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز
