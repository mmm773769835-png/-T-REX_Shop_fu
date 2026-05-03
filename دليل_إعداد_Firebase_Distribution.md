# دليل إعداد Firebase App Distribution - T-REX Shop

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إعداد Firebase App Distribution لتوزيع تطبيق Android للمختبرين بشكل تلقائي.

---

## 🔧 الخطوة 1: تثبيت Firebase CLI

```bash
npm install -g firebase-tools
```

للتحقق من التثبيت:
```bash
firebase --version
```

---

## 🔐 الخطوة 2: تسجيل الدخول إلى Firebase

```bash
firebase login
```

سيتم فتح المتصفح - سجل الدخول بحساب Google المرتبط بمشروع Firebase.

---

## 🎯 الخطوة 3: تفعيل Firebase App Distribution

### الطريقة الأولى: عبر Firebase Console

1. اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/appdistribution
2. اضغط "Get Started"
3. اقرأ الشروط واضغط "Accept"
4. تم تفعيل الخدمة! ✅

### الطريقة الثانية: عبر Firebase CLI

```bash
firebase init appdistribution
```

اتبع التعليمات:
- اختر المشروع: `t-rex-5b17f`
- اختر تطبيق Android
- App ID: `1:37814615065:android:3b39b3622c8fbc0358fe88`

---

## 👥 الخطوة 4: إعداد مجموعات المختبرين

### عبر Firebase Console:

1. اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/appdistribution/testers-and-groups
2. اضغط "Create Group"
3. اسم المجموعة: `testers`
4. أضف بريد المختبرين

### عبر CLI:

```bash
# إنشاء مجموعة
firebase appdistribution:groups:create testers

# إضافة مختبر
firebase appdistribution:testers:add testers tester@example.com
```

---

## 🔑 الخطوة 5: (اختياري) إنشاء Service Account

للاستخدام في CI/CD أو السكريبتات التلقائية:

1. اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/settings/serviceaccounts/adminsdk
2. اضغط "Generate new private key"
3. احفظ الملف (لا ترفعه إلى Git!)
4. استخدمه في السكريبتات

---

## 🚀 الاستخدام

### الطريقة 1: استخدام السكريبت الجاهز

```bash
# تشغيل سكريبت البناء والرفع التلقائي
.\بناء-ورفع-فيرباس.bat

# أو مع ملاحظات مخصصة
powershell -File .\بناء-ورفع-فيرباس.ps1 -ReleaseNotes "إصدار جديد - تحسينات الأداء"
```

### الطريقة 2: يدوياً

#### 1. بناء APK:

```bash
cd android
.\gradlew assembleRelease
cd ..
```

#### 2. رفع إلى Firebase:

```bash
firebase appdistribution:distribute android\app\build\outputs\apk\release\app-release.apk `
  --app 1:37814615065:android:3b39b3622c8fbc0358fe88 `
  --groups testers `
  --release-notes "إصدار جديد"
```

### الطريقة 3: استخدام npm scripts

```bash
# بناء ورفع معاً
npm run build:and:distribute

# أو منفصلاً
npm run build:android
npm run distribute:firebase
```

---

## 📱 إرسال الرابط للمختبرين

بعد الرفع:

1. المختبرون سيحصلون على رابط تحميل عبر البريد الإلكتروني
2. يمكنك أيضاً نسخ الرابط من Firebase Console
3. الرابط صالح لمدة 90 يوم

---

## 🔄 التكامل مع EAS Build (للمستقبل)

عند عودة حد البناء المجاني، يمكنك إضافة hook لرفع تلقائي:

في `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "hooks": {
        "postBuild": {
          "commands": ["powershell -File ./بناء-ورفع-فيرباس.ps1"]
        }
      }
    }
  }
}
```

---

## 📊 معلومات المشروع

- **Project ID:** `t-rex-5b17f`
- **App ID (Android):** `1:37814615065:android:3b39b3622c8fbc0358fe88`
- **Package Name:** `com.trexshop.app`
- **Tester Group:** `testers`

---

## ⚙️ إعدادات متقدمة

### رفع مع إصدار محدد:

```bash
firebase appdistribution:distribute app-release.apk `
  --app 1:37814615065:android:3b39b3622c8fbc0358fe88 `
  --groups testers `
  --release-notes "إصدار 2.0.0" `
  --version "2.0.0" `
  --version-code "2"
```

### رفع إلى مجموعة محددة:

```bash
firebase appdistribution:distribute app-release.apk `
  --app 1:37814615065:android:3b39b3622c8fbc0358fe88 `
  --groups "testers,developers,beta-users" `
  --release-notes "إصدار جديد"
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "App not found"
- تأكد من App ID صحيح
- تأكد من تفعيل Firebase App Distribution

### خطأ: "Group not found"
- أنشئ المجموعة أولاً: `firebase appdistribution:groups:create testers`

### خطأ: "Authentication failed"
- سجل الدخول: `firebase login`

### خطأ: "Permission denied"
- تأكد من صلاحيات المشروع في Firebase Console

---

## 📝 ملاحظات مهمة

1. **الحدود:**
   - الحد المجاني: 1000 تثبيت شهرياً
   - حجم APK: حتى 2GB

2. **الأمان:**
   - لا ترفع `firebase-service-account.json` إلى Git
   - استخدم `.gitignore`

3. **التحديثات:**
   - كل رفع جديد يحل محل الإصدار السابق في نفس المجموعة
   - المختبرون يحصلون على إشعار بالتحديث

---

## 🔗 روابط مفيدة

- Firebase Console: https://console.firebase.google.com/project/t-rex-5b17f
- App Distribution: https://console.firebase.google.com/project/t-rex-5b17f/appdistribution
- التوثيق: https://firebase.google.com/docs/app-distribution

---

**جاهز للاستخدام!** 🚀
