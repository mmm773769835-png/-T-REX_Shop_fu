# بناء تطبيق Android - T-REX Shop

## المقدمة
هذا المستند يشرح كيفية بناء تطبيق Android من مشروع T-REX Shop باستخدام Expo و EAS Build.

## المتطلبات

- Node.js (الإصدار 18 أو أعلى)
- Expo CLI
- EAS CLI
- Android SDK (مثبت مسبقًا)
- حساب Expo (اختياري للبناء المحلي)

## خطوات البناء

### 1. تثبيت الاعتمادات
```bash
npm install
```

### 2. معاينة التطبيق على جهاز Android
```bash
npx expo run:android
```

### 3. إنشاء بناء محلي (Local Build)
```bash
# بناء تطوير (Development Build)
npx eas build --platform android --profile development --local

# بناء تجريبي (Preview Build) 
npx eas build --platform android --profile preview --local

# بناء إنتاج (Production Build)
npx eas build --platform android --profile production --local
```

### 4. إنشاء بناء في السحابة (Cloud Build)
```bash
# بناء تطوير
npx eas build --platform android --profile development

# بناء تجريبي
npx eas build --platform android --profile preview

# بناء إنتاج
npx eas build --platform android --profile production
```

## تكوينات Android

### معلومات الحزمة
- اسم الحزمة: `com.trexshop.app`
- إصدار الحزمة: `2.0.0`
- رمز الإصدار: `2`

### الأذونات
- `INTERNET` - للاتصال بالإنترنت
- `VIBRATE` - للتنبيهات الاهتزازية
- `READ_EXTERNAL_STORAGE` و `WRITE_EXTERNAL_STORAGE` - لقراءة وكتابة الملفات
- `CAMERA` - لالتقاط الصور

### الأصول
- الرمز: `./assets/icon.png`
- الرمز التكيفي: `./assets/adaptive-icon.png`
- الشاشة الافتتاحية: `./assets/splash.png`

## دعم الميزات

### ميزات التطبيق
- مصادقة المستخدمين (Firebase)
- تخزين الصور (Firebase Storage)
- قاعدة بيانات المنتجات (Firestore)
- دعم اللغة العربية والإنجليزية
- إدارة العربة والطلبات
- لوحة تحكم المشرف

### ميزات Android
- دعم الهواتف والأجهزة اللوحية
- دعم الوضع المظلم
- دعم الشاشات المختلفة (Resizing)
- دعم الإشعارات (معلقة)

## إرشادات النشر

### للمتجر (Google Play Store)
1. استخدم `--profile production` لإنشاء AAB (Android App Bundle)
2. قم بتحميل الملف إلى Google Play Console
3. اتبع إرشادات Google لتقديم التطبيق للمراجعة

### للاختبار الداخلي
1. استخدم `--profile preview` لإنشاء APK
2. قم بتوزيع APK على المستخدمين للاختبار
3. تأكد من تمكين "مصادر غير معروفة" على أجهزة Android

## استكشاف الأخطاء

### مشاكل شائعة
- **Error: JAVA_HOME is not set**: تأكد من تثبيت Java وتعيين المتغير البيئي
- **Missing keystore**: استخدم EAS لتصنيع مفاتيح التوقيع تلقائيًا
- **Build timeout**: جرب البناء المحلي بدلًا من السحابة

### حلول سريعة
```bash
# مسح ذاكرة التخزين المؤقت
npx expo prebuild --clean

# مسح البناءات السابقة
npx eas build --clear-cache

# التحقق من التكوين
npx expo doctor
```

## أدوات الدعم

### سكربتات الإنشاء
- `build-android.ps1` - سكربت PowerShell
- `build-android.bat` - سكربت Batch
- `ANDROID_BUILD_GUIDE.md` - دليل مفصل

## ملاحظات إضافية

- يُفضل استخدام البناء المحلي إذا كنت تملك جهازًا قويًا
- تأكد من توفر اتصال إنترنت مستقر للبناء السحابي
- حافظ على تحديث تبعيات المشروع بانتظام
- احتفظ بنسخ احتياطية من مفاتيح التوقيع إذا كنت تستخدم مفاتيح مخصصة

## المساعدة

للحصول على مساعدة إضافية:
```bash
# مساعدة عامة
npx eas build --help

# مساعدة لأندرويد فقط
npx eas build --platform android --help

# معلومات عن الحساب
npx eas whoami
```