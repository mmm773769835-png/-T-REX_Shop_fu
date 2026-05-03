# تعليمات رفع الصور المزدوج (السيرفر المحلي + Firebase)

## نظرة عامة

تم إعداد النظام لرفع الصور إلى **كلا المكانين في نفس الوقت**:
1. **السيرفر المحلي** (Local Server)
2. **Firebase Storage**

## إعداد السيرفر المحلي

### 1. تثبيت المكتبات المطلوبة

```bash
cd server
npm install express-fileupload
```

### 2. تشغيل السيرفر

```bash
npm start
```

السيرفر سيعمل على المنفذ `4001` (أو المنفذ المحدد في ملف `.env`).

### 3. التحقق من عمل السيرفر

افتح المتصفح وانتقل إلى:
```
http://localhost:4001/api/health
```

يجب أن ترى رسالة `{"status":"ok"}`.

## إعداد عنوان السيرفر في التطبيق

### الطريقة 1: استخدام متغير البيئة (موصى به)

أنشئ ملف `.env` في المجلد الرئيسي وأضف:

```env
EXPO_PUBLIC_SERVER_URL=http://localhost:4001
```

أو للسيرفر على الشبكة:

```env
EXPO_PUBLIC_SERVER_URL=http://192.168.1.100:4001
```

### الطريقة 2: تعديل الكود مباشرة

في ملف `src/screens/AdminScreen.tsx`، يمكنك تغيير:

```typescript
const LOCAL_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:4001';
```

## كيف يعمل النظام

### عند رفع صورة:

1. **حفظ محلي على الجهاز**: يتم حفظ الصورة في مجلد `products/` على الجهاز
2. **تحويل إلى base64**: يتم تحويل الصورة إلى base64
3. **رفع متوازي (Parallel)**:
   - رفع إلى السيرفر المحلي عبر `/api/upload/image-base64`
   - رفع إلى Firebase Storage في نفس الوقت
4. **اختيار الصورة النهائية**:
   - الأولوية للسيرفر المحلي
   - إذا فشل، استخدام Firebase
   - إذا فشل كليهما، استخدام الصورة المحلية على الجهاز
   - إذا فشل كل شيء، استخدام الصورة الافتراضية

## Endpoints المتاحة

### 1. رفع صورة (base64)
```
POST /api/upload/image-base64
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
  "filename": "product_1234567890_123.jpg"
}
```

**الرد:**
```json
{
  "success": true,
  "url": "http://localhost:4001/uploads/products/product_1234567890_123.jpg",
  "filename": "product_1234567890_123.jpg",
  "message": "تم رفع الصورة بنجاح"
}
```

### 2. رفع صورة (ملف)
```
POST /api/upload/image
Content-Type: multipart/form-data

Form Data:
  image: [file]
```

### 3. الوصول إلى الصور

الصور المحفوظة متاحة عبر:
```
http://localhost:4001/uploads/products/[filename]
```

## مجلد الصور

الصور تُحفظ في:
```
server/uploads/products/
```

يتم إنشاء المجلد تلقائياً عند تشغيل السيرفر لأول مرة.

## استكشاف الأخطاء

### السيرفر لا يعمل:
- تأكد من تثبيت `express-fileupload`: `npm install express-fileupload`
- تأكد من أن المنفذ 4001 غير مستخدم
- تحقق من ملف `.env` في مجلد `server`

### الصور لا تُرفع إلى السيرفر:
- تأكد من أن السيرفر يعمل: `http://localhost:4001/api/health`
- تحقق من عنوان السيرفر في `.env` أو في الكود
- تأكد من أن السيرفر يمكن الوصول إليه من التطبيق (للأجهزة، استخدم IP الشبكة وليس localhost)

### الصور لا تُرفع إلى Firebase:
- تأكد من تفعيل Firebase Storage في Firebase Console
- تحقق من قواعد الأمان في Firebase Storage
- تأكد من أن بيانات Firebase صحيحة في `FirebaseAuthService.js`

## ملاحظات مهمة

1. **الأولوية**: السيرفر المحلي له الأولوية في العرض
2. **الرفع المتوازي**: يتم الرفع إلى كلا المكانين في نفس الوقت لتوفير الوقت
3. **التعامل مع الأخطاء**: إذا فشل أحد الرفعين، يستمر الآخر
4. **الحجم الأقصى**: حجم الصورة الأقصى 10MB

## للتطوير على الأجهزة

عند تشغيل التطبيق على جهاز حقيقي:

1. احصل على IP جهاز الكمبيوتر:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. استخدم IP بدلاً من localhost:
   ```env
   EXPO_PUBLIC_SERVER_URL=http://192.168.1.100:4001
   ```

3. تأكد من أن الجهاز والكمبيوتر على نفس الشبكة

## للإنتاج

للاستخدام في الإنتاج:

1. استضف السيرفر على خادم (VPS, Heroku, etc.)
2. غيّر `EXPO_PUBLIC_SERVER_URL` إلى عنوان السيرفر الإنتاجي
3. تأكد من إعداد HTTPS للأمان









