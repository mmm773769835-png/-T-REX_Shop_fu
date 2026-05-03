# ✅ حل مشكلة Network Error - خطوة واحدة فقط!

## 🎯 المشكلة
```
ERROR ❌ خطأ أثناء إرسال OTP: Network Error
```

## 🔧 الحل السريع

### الخيار 1: إذا كان لديك سيرفر في مجلد آخر على الإنترنت

افتح `config/api.config.js` وغيّر:
```javascript
const USE_LOCAL_SERVER = false;
const PRODUCTION_API_URL = "https://your-server-url.com"; // ⚠️ ضع عنوان سيرفرك هنا
```

### الخيار 2: إذا كان لديك سيرفر محلي (في مجلد آخر على نفس الجهاز)

**1. احصل على IP address:**
```powershell
ipconfig
```
ابحث عن "IPv4 Address" (مثلاً: `192.168.1.100`)

**2. حدّث `config/api.config.js`:**
```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = true; // ⚠️ غيّر إلى true
const LOCAL_IP = '192.168.1.100'; // ⚠️ ضع IP address جهازك
const PORT = 3000; // ⚠️ ضع المنفذ الصحيح (3000 أو أي منفذ آخر)
```

### الخيار 3: إذا كان السيرفر على نفس الجهاز

```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = false;
const USE_LOCALHOST = true;
const PORT = 3000;
```

## ✅ بعد التحديث

1. **احفظ الملف**
2. **أعد تحميل التطبيق** (اضغط `r` في Terminal أو Reload)
3. **تحقق من console** - ستظهر: `🔗 API Server URL: ...`
4. **تأكد أن السيرفر يعمل** قبل تجربة OTP

## 🆘 لا يزال لا يعمل؟

1. ✅ تأكد أن السيرفر **يعمل**
2. ✅ اختبر في المتصفح: `http://YOUR_IP:PORT/api/auth/check`
3. ✅ تحقق من Firewall
4. ✅ تأكد أن الهاتف والكمبيوتر على **نفس الشبكة** (إذا كان محلي)










