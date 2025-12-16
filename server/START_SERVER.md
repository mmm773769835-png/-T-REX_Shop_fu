# تشغيل سيرفر OTP 🚀

## الطريقة السريعة (PowerShell)

1. افتح PowerShell في مجلد `server`
2. شغل الأمر:
   ```powershell
   .\start-otp-server.ps1
   ```

## الطريقة اليدوية

### 1. إنشاء ملف .env

أنشئ ملف `.env` في مجلد `server` وأضف التالي:

```env
PORT=3000
ADMIN_USER=owner
ADMIN_HASH=YOUR_HASH_HERE
JWT_SECRET=trex_shop_secret_key_change_in_production_2024
```

### 2. توليد Hash لكلمة المرور

شغل:
```bash
cd server
node create-hash.js
```

انسخ الناتج وضعّه في `ADMIN_HASH` في ملف `.env`

### 3. تشغيل السيرفر

```bash
npm start
```

## ملاحظات

- ✅ السيرفر يعمل في وضع التطوير بدون Twilio
- ✅ رمز OTP سيظهر في console (لا حاجة لرسالة SMS حقيقية)
- ✅ السيرفر يعمل على: `http://localhost:3000`
- ✅ للتطوير من الهاتف: استخدم IP address جهازك بدلاً من localhost

## التحقق من عمل السيرفر

افتح المتصفح على: `http://localhost:3000/api/auth/check`

يجب أن ترى: `{"ok":false}` (هذا طبيعي لأنك لم ترسل token)




