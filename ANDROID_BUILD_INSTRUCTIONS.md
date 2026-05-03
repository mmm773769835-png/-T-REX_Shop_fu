# تعليمات بناء تطبيق Android

## المتطلبات الأساسية

1. **Node.js** (الإصدار 18 أو أحدث)
2. **Expo CLI** - قم بتثبيته عبر:
   ```bash
   npm install -g expo-cli
   ```
3. **EAS CLI** - قم بتثبيته عبر:
   ```bash
   npm install -g eas-cli
   ```
4. **حساب Expo** - سجل الدخول عبر:
   ```bash
   eas login
   ```

## إعداد Firebase

✅ **تم إعداد Firebase بالفعل:**
- ملف `google-services.json` موجود ومُعد بشكل صحيح
- إعدادات Firebase في `FirebaseAuthService.js` جاهزة
- Package name: `com.trexshop.app`

## ملاحظة مهمة حول Firebase Storage

⚠️ **Firebase Storage غير مفعّل حالياً** - التطبيق مُعد للعمل بدون Storage:
- عند رفع الصور، سيتم حفظها محلياً على الجهاز
- إذا فشل رفع الصورة إلى Firebase Storage، سيتم استخدام الصورة المحلية أو الصورة الافتراضية
- يمكنك تفعيل Firebase Storage لاحقاً من Firebase Console

## بناء التطبيق

### 1. بناء APK للاختبار (Preview)

```bash
eas build --platform android --profile preview
```

هذا سينشئ ملف APK يمكن تثبيته مباشرة على الأجهزة.

### 2. بناء App Bundle للإنتاج (Production)

```bash
eas build --platform android --profile production
```

هذا سينشئ ملف AAB (Android App Bundle) جاهز للرفع على Google Play Store.

### 3. بناء APK محلياً (Local Build)

إذا كنت تريد البناء محلياً:

```bash
npx expo run:android
```

**ملاحظة:** يتطلب هذا Android Studio و Android SDK.

## الإعدادات الحالية

### Android Configuration:
- **Package Name:** `com.trexshop.app`
- **Version Code:** 2
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 34 (Android 14)
- **Compile SDK:** 34

### Permissions:
- INTERNET
- VIBRATE
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- CAMERA

## تفعيل Firebase Storage (لاحقاً)

عندما تكون جاهزاً لتفعيل Firebase Storage:

1. افتح Firebase Console: https://console.firebase.google.com
2. اختر مشروع `t-rex-5b17f`
3. اذهب إلى **Storage** من القائمة الجانبية
4. اضغط على **Get Started**
5. اختر **Start in test mode** (للاختبار) أو قم بإعداد القواعد المناسبة
6. اختر موقع Storage (يفضل نفس موقع Firestore)

بعد التفعيل، سيعمل رفع الصور إلى Firebase Storage تلقائياً.

## استكشاف الأخطاء

### خطأ في البناء:
- تأكد من أنك سجلت الدخول إلى EAS: `eas login`
- تأكد من أن `google-services.json` موجود في المجلد الرئيسي
- تأكد من أن Package name في `app.json` يطابق `google-services.json`

### خطأ في Firebase:
- تأكد من أن Firebase project ID صحيح: `t-rex-5b17f`
- تأكد من أن `google-services.json` محدث

### خطأ في الصور:
- التطبيق مُعد للعمل بدون Firebase Storage
- الصور ستُحفظ محلياً على الجهاز
- يمكن تفعيل Storage لاحقاً

## الدعم

إذا واجهت أي مشاكل، تحقق من:
1. ملف `app.json` - إعدادات Android
2. ملف `google-services.json` - إعدادات Firebase
3. ملف `FirebaseAuthService.js` - إعدادات Firebase في الكود









