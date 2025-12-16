# 🔧 حل مشكلة Network Error في OTP

## المشكلة ❌
```
ERROR ❌ خطأ أثناء إرسال OTP: Network Error
```

## السبب 🔍
1. السيرفر غير مشغل
2. `localhost:3000` لا يعمل على Android (يبحث عن localhost في الجهاز نفسه)

## الحل ✅

### الخطوة 1: احصل على IP Address جهازك

افتح PowerShell أو Command Prompt واكتب:
```powershell
ipconfig
```

ابحث عن "IPv4 Address" (مثلاً: `192.168.1.100`)

أو شغل:
```bash
cd server
node get-ip.js
```

### الخطوة 2: حدّث AuthService.js

افتح `services/AuthService.js` واستبدل:
```javascript
const DEV_IP = 'YOUR_IP_HERE'; // ⚠️ غيّر هذا
```

بـ:
```javascript
const DEV_IP = '192.168.1.100'; // استخدم IP address جهازك
```

### الخطوة 3: شغّل السيرفر

افتح Terminal جديد في مجلد `server`:

```bash
cd server
node quick-start.js
```

أو يدوياً:
```bash
cd server
npm start
```

### الخطوة 4: تأكد من الاتصال

بعد تشغيل السيرفر، افتح المتصفح:
```
http://YOUR_IP:3000/api/auth/check
```

يجب أن ترى: `{"ok":false}` (هذا طبيعي)

## ملاحظات مهمة 📝

- ✅ السيرفر يجب أن يعمل على الكمبيوتر
- ✅ الهاتف/المحاكي والكمبيوتر يجب أن يكونا على نفس الشبكة WiFi
- ✅ استخدم IP address وليس localhost للـ Android
- ✅ رمز OTP سيظهر في console السيرفر (وضع التطوير)

## استكشاف الأخطاء 🔍

### المشكلة: "Network Error" ما زال يظهر
1. ✅ تأكد أن السيرفر يعمل (افتح http://YOUR_IP:3000/api/auth/check)
2. ✅ تأكد أن IP address صحيح في AuthService.js
3. ✅ تأكد أن الهاتف والكمبيوتر على نفس الشبكة

### المشكلة: "Connection refused"
- السيرفر غير مشغل - شغّله أولاً

### المشكلة: "Timeout"
- تحقق من Firewall - قد يحتاج السيرفر لإذن الوصول للشبكة




