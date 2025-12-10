# إعداد السيرفر - T-REX Shop

## المتطلبات المثبتة ✅

جميع المكتبات المطلوبة مثبتة:
- ✅ express
- ✅ bcrypt
- ✅ jsonwebtoken
- ✅ express-rate-limit
- ✅ helmet
- ✅ cors
- ✅ dotenv
- ✅ twilio

## إعداد ملف .env

أنشئ ملف `.env` في مجلد `server` وأضف التالي:

```env
# Server Configuration
PORT=3000

# Admin Credentials
ADMIN_USER=owner
ADMIN_HASH=your_bcrypt_hash_here
# لتوليد hash: node create-hash.js

# JWT Secret
JWT_SECRET=your_secret_key_here_change_this_in_production

# Twilio Configuration (اختياري - السيرفر يعمل بدونها في وضع التطوير)
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_FROM=your_whatsapp_number
```

## خطوات الإعداد

1. **إنشاء hash لكلمة المرور:**
   ```bash
   cd server
   node create-hash.js
   ```
   انسخ الناتج وضعّه في `ADMIN_HASH` في ملف `.env`

2. **تشغيل السيرفر:**
   ```bash
   npm start
   ```

## ملاحظات

- السيرفر يعمل في وضع التطوير بدون Twilio (يعرض OTP في console)
- للتطوير المحلي: استخدم `http://localhost:3000`
- للإنتاج: استبدل الرابط في ملفات API

