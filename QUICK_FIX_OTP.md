# ⚡ حل سريع لمشكلة Network Error في OTP

## 🚨 المشكلة الحالية
```
ERROR ❌ خطأ أثناء إرسال OTP: Network Error
```

## ✅ الحل في 3 خطوات

### 1️⃣ احصل على IP Address جهازك

**في PowerShell:**
```powershell
ipconfig
```
ابحث عن "IPv4 Address" مثل: `192.168.1.100`

**أو:**
```bash
cd server
node get-ip.js
```

### 2️⃣ حدّث `services/AuthService.js`

افتح الملف وابحث عن السطر:
```javascript
const DEV_IP = 'YOUR_IP_HERE';
```

غيّره إلى IP address جهازك، مثلاً:
```javascript
const DEV_IP = '192.168.1.100';
```

### 3️⃣ شغّل السيرفر

افتح Terminal **جديد** في مجلد `server`:

```bash
cd server
node quick-start.js
```

سترى:
```
✅ .env file created/updated successfully!
🚀 Starting OTP Server...
📡 Server will run on: http://localhost:3000
```

## ✅ جاهز!

الآن جرّب التطبيق مرة أخرى - يجب أن يعمل OTP!

## 📝 ملاحظات

- السيرفر يجب أن يعمل **قبل** فتح التطبيق
- رمز OTP سيظهر في console السيرفر (وضع التطوير)
- للجهاز الحقيقي: استخدم IP address
- للمحاكي: يمكن استخدام localhost










