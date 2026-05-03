# 🚨 حل فوري لمشكلة Network Error

## المشكلة الحالية
```
ERROR ❌ خطأ أثناء إرسال OTP: Network Error
```

## 🔧 الحل السريع (3 خطوات)

### الخطوة 1: حدّد موقع سيرفرك

**أ) إذا كان السيرفر في مجلد آخر على نفس الجهاز:**
- احصل على IP address
- حدّث `config/api.config.js`

**ب) إذا كان السيرفر على الإنترنت:**
- استخدم عنوان URL الكامل
- حدّث `config/api.config.js`

### الخطوة 2: حدّث ملف الإعدادات

افتح `config/api.config.js`:

#### للحالة أ (سيرفر محلي):
```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = true;
const LOCAL_IP = '192.168.1.100'; // ⚠️ استبدل بـ IP address جهازك
const PORT = 3000; // ⚠️ استبدل بالمنفذ الصحيح
```

#### للحالة ب (سيرفر على الإنترنت):
```javascript
const USE_LOCAL_SERVER = false;
const PRODUCTION_API_URL = "https://your-server.com"; // ⚠️ استبدل بعنوان سيرفرك
```

### الخطوة 3: تأكد أن السيرفر يعمل

**إذا كان السيرفر محلياً:**
- شغّل السيرفر
- اختبر: افتح `http://YOUR_IP:PORT/api/auth/check` في المتصفح

**إذا كان على الإنترنت:**
- تأكد أن السيرفر متاح
- اختبر: افتح `https://your-server.com/api/auth/check` في المتصفح

## 📋 معرفة IP Address

في PowerShell:
```powershell
ipconfig
```
ابحث عن "IPv4 Address"

## ✅ بعد التحديث

1. احفظ الملف
2. أعد تشغيل التطبيق (reload)
3. ستظهر رسالة في console: `🔗 API Server URL: ...`
4. تأكد أن العنوان صحيح
5. جرّب OTP مرة أخرى

## 🆘 لا يزال لا يعمل؟

1. ✅ تحقق من Firewall
2. ✅ تأكد أن السيرفر يعمل
3. ✅ اختبر الاتصال في المتصفح
4. ✅ تحقق من console للتأكد من العنوان المستخدم










