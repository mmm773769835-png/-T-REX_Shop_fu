# ✅ تم إعداد سيرفر OTP بنجاح!

## 🚀 تشغيل السيرفر

### الطريقة السريعة (موصى بها):

```bash
cd server
node quick-start.js
```

هذا السكريبت سيقوم تلقائياً بـ:
- ✅ إنشاء ملف `.env`
- ✅ توليد hash لكلمة المرور
- ✅ تشغيل السيرفر

### الطريقة اليدوية:

1. **إنشاء hash:**
   ```bash
   cd server
   node create-hash.js
   ```
   انسخ الناتج

2. **إنشاء ملف `.env`** في مجلد `server`:
   ```env
   PORT=3000
   ADMIN_USER=owner
   ADMIN_HASH=PASTE_HASH_HERE
   JWT_SECRET=trex_shop_secret_key_change_in_production_2024
   ```

3. **تشغيل السيرفر:**
   ```bash
   npm start
   ```

## 📱 إعداد التطبيق

### للعمل على المحاكي (localhost):

الملف `services/AuthService.js` جاهز ويستخدم:
- `http://localhost:3000` في وضع التطوير

### للعمل على الهاتف الحقيقي:

1. احصل على IP address جهازك:
   ```powershell
   ipconfig
   ```
   ابحث عن "IPv4 Address" (مثلاً: `192.168.1.100`)

2. حدّث `services/AuthService.js`:
   ```javascript
   const API_URL = "http://192.168.1.100:3000"
   ```

3. تأكد أن الهاتف والكمبيوتر على نفس الشبكة WiFi

## 🔐 بيانات الدخول

- **Username:** `owner`
- **Password:** `773769835As`

## ✨ الميزات

- ✅ وضع التطوير: رمز OTP يظهر في console (لا حاجة لـ Twilio)
- ✅ JWT Token: يتم إنشاء token بعد التحقق من OTP
- ✅ أمان: Rate limiting و Helmet للحماية

## 🔍 التحقق من عمل السيرفر

بعد تشغيل السيرفر، افتح المتصفح:
```
http://localhost:3000/api/auth/check
```

يجب أن ترى: `{"ok":false}` (هذا طبيعي)

## 📝 ملاحظات

- السيرفر يعمل في الخلفية على المنفذ 3000
- رمز OTP صالح لمدة 5 دقائق
- JWT Token صالح لمدة ساعة واحدة

## 🆘 استكشاف الأخطاء

1. **السيرفر لا يبدأ:**
   - تحقق من أن المنفذ 3000 غير مستخدم
   - تأكد من تثبيت المكتبات: `npm install`

2. **خطأ في الاتصال:**
   - تحقق من أن السيرفر يعمل
   - تحقق من العنوان في `AuthService.js`
   - للهاتف: تأكد من استخدام IP address وليس localhost

3. **خطأ في المصادقة:**
   - تحقق من أن hash في `.env` صحيح
   - أعد توليد hash إذا لزم الأمر


