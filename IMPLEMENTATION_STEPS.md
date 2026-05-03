# 🚀 دليل التطبيق - التحسينات الأمنية

## 📋 الخطوات المطلوبة لتطبيق التحسينات

اتبع هذه الخطوات بالترتيب لتطبيق جميع التحسينات الأمنية على تطبيقك.

---

## المرحلة 1: تثبيت المكتبات الجديدة ⬇️

### الخطوة 1.1: تثبيت مكتبات السيرفر
```bash
cd server
npm install
```

**المكتبات المثبتة:**
- ✅ csurf v1.11.0 (CSRF protection)
- ✅ express-validator v7.0.1 (Input validation)
- ✅ xss-clean v0.1.4 (XSS protection)
- ✅ express-mongo-sanitize v2.2.0 (NoSQL injection)

### الخطوة 1.2: التحقق من التثبيت
```bash
npm list | grep -E "csurf|validator|xss|mango"
```

يجب أن ترى:
```
├── csurf@1.11.0
├── express-validator@7.0.1
├── express-mongo-sanitize@2.2.0
└── xss-clean@0.1.4
```

---

## المرحلة 2: إعداد Environment Variables 🔐

### الخطوة 2.1: إنشاء ملف .env
```bash
cd server
cp .env.example .env
```

### الخطوة 2.2: إنشاء Hash لكلمة المرور

**الطريقة 1: تفاعلية (موصى بها)**
```bash
node create-admin-hash.js
```
أدخل كلمة المرور عندما تُطلب منك (مثلاً: `Admin@123456`)

**الطريقة 2: سطر الأوامر**
```bash
node create-admin-hash.js "Admin@123456"
```

### الخطوة 2.3: تحرير .env
افتح `server/.env` وأضف:

```env
# ========================================
# مدير النظام
# ========================================
ADMIN_USER=owner
ADMIN_HASH=$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# ↑ ضع هنا الهاش من الخطوة السابقة
ADMIN_EMAIL=admin@t-rex-shop.com

# ========================================
# JWT Secret
# ========================================
# أنشئ سلسلة عشوائية طويلة:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_random_string_min_32_characters_here

# ========================================
# Twilio (اختياري - للرسائل SMS)
# ========================================
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_FROM=

# ========================================
# إعدادات السيرفر
# ========================================
PORT=4001
NODE_ENV=development

# ========================================
# CORS
# ========================================
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:19002

# ========================================
# الأمان
# ========================================
BCRYPT_ROUNDS=10
```

### الخطوة 2.4: اختبار الإعدادات
```bash
npm start
```

افتح المتصفح: `http://localhost:4001/api/health`

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## المرحلة 3: تحديث Firestore Rules 🔒

### الخطوة 3.1: مراجعة القواعد الجديدة
افتح `firestore.rules` وتأكد من وجود:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isLoggedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'mmm712874799@gmail.com';
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // ... بقية القواعد
  }
}
```

### الخطوة 3.2: رفع القواعد
```bash
firebase deploy --only firestore:rules
```

### الخطوة 3.3: التحقق
```bash
firebase firestore:rules:list
```

---

## المرحلة 4: اختبار التحسينات ✅

### الاختبار 1: تسجيل دخول المدير

**باستخدام cURL:**
```bash
curl -X POST http://localhost:4001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@t-rex-shop.com",
    "password": "كلمة_المرور_التي_وضعتها"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "token": "eyJhbGci...",
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "email": "admin@t-rex-shop.com",
    "role": "admin"
  }
}
```

### الاختبار 2: Input Validation

**جرب إدخال اسم منتج به أحرف خاصة:**
```javascript
// في AddProduct
name: "<script>alert('XSS')</script>"
// النتيجة: خطأ - أحرف غير مسموحة ✅
```

**جرب سعر غير صالح:**
```javascript
price: -100
// النتيجة: خطأ - سعر غير صحيح ✅
```

### الاختبار 3: Rate Limiting

**حاول إرسال 15 طلب OTP سريعاً:**
```bash
for i in {1..15}; do
  curl -X POST http://localhost:4001/api/auth/request-otp \
    -H "Content-Type: application/json" \
    -d '{"username":"owner","password":"pass","phone":"771234567"}'
done
```

**النتيجة:** بعد 10 محاولات، سيتم حظر الطلبات ✅

### الاختبار 4: XSS Protection

**جرب إدخال script في الوصف:**
```javascript
description: "<script>document.location='http://evil.com'</script>"
// النتيجة: سيتم تنظيفه بواسطة xss-clean ✅
```

---

## المرحلة 5: التحقق من Frontend 📱

### الاختبار 5.1: RegisterScreen

1. افتح التطبيق
2. اذهب إلى شاشة التسجيل
3. جرب:
   - اسم بأحرف خاصة: `Ahmed@123` ❌
   - بريد غير صالح: `test@test` ❌
   - كلمة مرور قصيرة: `123456` ❌
   - كلمة مرور بدون أرقام: `Password` ❌

**كل المحاولات يجب أن ترفض مع رسائل خطأ واضحة** ✅

### الاختبار 5.2: AddProduct

1. سجل كمدير
2. حاول إضافة منتج:
   - اسم به scripts: `<script>...` ❌
   - وصف قصير جداً (< 10 أحرف) ❌
   - سعر سالب ❌

**كل المحاولات يجب أن ترفض** ✅

---

## المرحلة 6: النشر للإنتاج 🌐

### الخطوة 6.1: تحديث Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<random_64_chars>
BCRYPT_ROUNDS=12
HTTPS=true
```

### الخطوة 6.2: إنشاء JWT Secret قوي
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

انسخ الناتج وضعه في `JWT_SECRET`

### الخطوة 6.3: تفعيل HTTPS

في الإنتاج، استخدم HTTPS دائماً:

```javascript
// في السيرفر
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(PORT);
```

---

## 🧹 التنظيف والصيانة

### أسبوعياً
- [ ] راجع security logs
- [ ] تحقق من محاولات الدخول الفاشلة
- [ ] حدّث المكتبات الأمنية

### شهرياً
- [ ] بدّل JWT_SECRET
- [ ] راجع Firestore rules
- [ ] اختبر الثغرات الأمنية

### كل 3 أشهر
- [ ] غيّر كلمة مرور المدير
- [ ] قم بمراجعة أمنية شاملة
- [ ] حدّث التوثيق

---

## ⚠️ استكشاف الأخطاء

### المشكلة: "Cannot find module 'csurf'"
**الحل:**
```bash
cd server
npm install
```

### المشكلة: "ADMIN_HASH not configured"
**الحل:**
1. تأكد من وجود `.env`
2. تحقق من وجود `ADMIN_HASH`
3. أعد تشغيل السيرفر

### المشكلة: "Firebase permission denied"
**الحل:**
```bash
firebase deploy --only firestore:rules
```

### المشكلة: CORS error
**الحل:**
```env
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:19002,your-app-url
```

---

## 📞 الحصول على المساعدة

إذا واجهت مشكلة:

1. **راجع logs:**
   ```bash
   npm start
   # راقب الأخطاء
   ```

2. **اختبر كل مكون:**
   ```bash
   curl http://localhost:4001/api/health
   ```

3. **راجع التوثيق:**
   - `SECURITY_IMPROVEMENTS.md`
   - `SETUP_ENV_GUIDE.md`
   - `SECURITY_UPDATES_AR.md`

---

## ✅ Checklist نهائي

بعد اتباع جميع الخطوات، تأكد من:

- [ ] ✅ المكتبات الجديدة مثبتة
- [ ] ✅ ملف `.env` موجود ومهيأ
- [ ] ✅ كلمة مرور المدير مشفرة
- [ ] ✅ Firestore rules محدثة
- [ ] ✅ تسجيل الدخول يعمل
- [ ] ✅ Input validation يعمل
- [ ] ✅ Rate limiting يعمل
- [ ] ✅ XSS protection يعمل
- [ ] ✅ CSRF protection للويب مفعل

---

**تاريخ الإنشاء:** 2026-03-25  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للتطبيق
