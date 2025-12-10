# 🔧 إعداد سيرفر rrst

## ✅ تم إصلاح الخطأ!

تم إصلاح الخطأ في ملف الإعدادات. الآن يمكنك استخدام سيرفر `rrst`.

## 📝 الخطوة التالية: حدّث عنوان السيرفر

افتح ملف: `config/api.config.js`

ابحث عن السطر:
```javascript
const PRODUCTION_API_URL = "http://your-rrst-server-url.com";
```

## 🎯 حدّث العنوان حسب موقع سيرفر rrst:

### إذا كان السيرفر على الإنترنت:
```javascript
const PRODUCTION_API_URL = "https://rrst.example.com";
// أو
const PRODUCTION_API_URL = "https://api.rrst.com";
```

### إذا كان السيرفر محلياً (في مجلد آخر):
```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = true;
const LOCAL_IP = '10.56.255.204'; // IP address الجهاز
const PORT = 3000; // المنفذ الذي يعمل عليه السيرفر
```

## ❓ أسئلة لتحديد الإعدادات:

1. **هل سيرفر rrst يعمل على الإنترنت؟**
   - نعم → ضع URL الكامل (مثلاً: `https://rrst.com`)
   - لا → استخدم IP address

2. **ما هو عنوان/URL سيرفر rrst؟**
   - إذا كان على الإنترنت: ما هو الرابط؟
   - إذا كان محلياً: ما هو IP address والمنفذ؟

3. **ما هو المنفذ (Port) الذي يعمل عليه السيرفر؟**
   - 3000؟
   - 8080؟
   - منفذ آخر؟

## ✅ بعد التحديث:

1. احفظ الملف
2. اضغط `r` في Terminal لتحديث التطبيق
3. ستظهر رسالة: `🔗 API Server URL: ...`
4. تأكد أن العنوان صحيح!

## 📋 مثال:

إذا كان السيرفر على:
- الإنترنت: `https://api.rrst.com`
- محلي: `http://10.56.255.204:3000`

أخبرني بالعنوان وسأحدّث الملف لك مباشرة! 🚀


