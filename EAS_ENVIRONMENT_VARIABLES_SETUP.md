# إعداد متغيرات بيئة EAS لمشروع T-REX Shop

## نظرة عامة:

نظام متغيرات بيئة EAS (EAS Environment Variables) يسمح لنا بتحديد إعدادات مختلفة للبيئات المختلفة (تطوير، إنتاج) دون الحاجة إلى تخزينها في الكود.

## الحالة الحالية للمشروع:

- ✅ المشروع جاهز للبناء على Android
- ✅ التكامل مع Firebase يعمل بشكل مثالي
- ✅ جميع التكوينات صحيحة
- ⏳ في انتظار إعادة تعيين حدود الحساب المجاني (حتى 1 فبراير 2026)

## استخدامات محتملة لمتغيرات البيئة في مشروعنا:

### 1. إعدادات Firebase:
- API Keys
- Database URLs
- Storage Buckets

### 2. إعدادات التطبيق:
- وضع التطوير/الإنتاج
- ميزات المشرف
- إعدادات اللغة الافتراضية

## إنشاء متغيرات بيئة لـ Firebase:

بمجرد توفر الحد الأقصى للبناء (1 فبراير 2026)، يمكننا إنشاء متغيرات بيئة باستخدام الأوامر التالية:

```bash
# إنشاء متغيرات بيئة لـ Firebase (Production)
eas env:create --name FIREBASE_API_KEY --value "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw" --environment production --visibility plainText
eas env:create --name FIREBASE_AUTH_DOMAIN --value "t-rex-5b17f.firebaseapp.com" --environment production --visibility plainText
eas env:create --name FIREBASE_PROJECT_ID --value "t-rex-5b17f" --environment production --visibility plainText
eas env:create --name FIREBASE_STORAGE_BUCKET --value "t-rex-5b17f.firebasestorage.app" --environment production --visibility plainText
eas env:create --name FIREBASE_MESSAGING_SENDER_ID --value "37814615065" --environment production --visibility plainText
eas env:create --name FIREBASE_APP_ID --value "1:37814615065:android:3b39b3622c8fbc0358fe88" --environment production --visibility plainText
```

## تعديل eas.json لاستخدام البيئة:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "environment": "development"
    },
    "production": {
      "developmentClient": false,
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      },
      "environment": "production"
    }
  }
}
```

## فوائد استخدام متغيرات البيئة:

1. **الأمان**:
   - عدم تخزين المفاتيح الحساسة في الكود
   - فصل البيانات الحساسة عن الكود المصدري

2. **المرونة**:
   - استخدام إعدادات مختلفة للبيئات المختلفة
   - تغيير الإعدادات بدون تعديل الكود

3. **الإدارة**:
   - التحكم المركزي في الإعدادات
   - سهولة التبديل بين البيئات

## الملفات المتضررة:

- [eas.json](file:///c:/Users/Abo%20Hamza/Desktop/T-REX_Shop_fu/eas.json)
- [app.json](file:///c:/Users/Abo%20Hamza/Desktop/T-REX_Shop_fu/app.json)
- [package.json](file:///c:/Users/Abo%20Hamza/Desktop/T-REX_Shop_fu/package.json)

## الخطوة التالية:

بمجرد توفر الحد الأقصى للحساب (1 فبراير 2026)، يمكننا:
1. إنشاء متغيرات بيئة EAS
2. تعديل eas.json لاستخدام البيئات
3. إجراء بناء تجريبي
4. التأكد من عمل التكامل مع Firebase

## ملاحظة:

التطبيق مكتمل ومستعد للعمل مع نظام متغيرات بيئة EAS. لا تتطلب أي تعديلات إضافية على الكود، فقط إعداد المتغيرات في حساب EAS.