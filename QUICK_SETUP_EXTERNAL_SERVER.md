# ⚡ إعداد سريع: استخدام سيرفر موجود

## 🎯 خطوة واحدة فقط!

### افتح `config/api.config.js` وحدّث:

#### إذا كان السيرفر على الإنترنت:
```javascript
const USE_LOCAL_SERVER = false;
const PRODUCTION_API_URL = "https://your-server.com";
```

#### إذا كان السيرفر على جهاز آخر (نفس الشبكة):
```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = true;
const LOCAL_IP = '192.168.1.100'; // IP address الجهاز
const PORT = 3000; // المنفذ
```

#### إذا كان السيرفر على نفس الجهاز:
```javascript
const USE_LOCAL_SERVER = true;
const USE_IP = false;
const USE_LOCALHOST = true;
const PORT = 3000;
```

## ✅ انتهى!

كل ملفات API تستخدم هذا الإعداد تلقائياً:
- ✅ `services/AuthService.js`
- ✅ `src/api/auth.ts`
- ✅ `src/api/api.js.js`

## 🔍 للتحقق:

عند تشغيل التطبيق، ستظهر في console:
```
🔗 API Server URL: http://...
```

## 📚 للمزيد من التفاصيل:

راجع: `إعداد_سيرفر_خارجي_خطوة_خطوة.md`


