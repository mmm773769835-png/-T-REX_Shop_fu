# إعداد Firebase App Distribution للبناء والتوزيع

## 📋 نظرة عامة

Firebase App Distribution يسمح لك بتوزيع تطبيق Android للمختبرين وإدارة الإصدارات بسهولة.

---

## 🔧 المتطلبات

1. **Firebase CLI** - يجب تثبيته:
   ```bash
   npm install -g firebase-tools
   ```

2. **تسجيل الدخول إلى Firebase:**
   ```bash
   firebase login
   ```

3. **مشروع Firebase موجود:**
   - Project ID: `t-rex-5b17f`
   - Package Name: `com.trexshop.app`

---

## 🚀 الخطوة 1: تثبيت Firebase CLI

```bash
npm install -g firebase-tools
```

---

## 🔐 الخطوة 2: تسجيل الدخول

```bash
firebase login
```

---

## 📦 الخطوة 3: تفعيل Firebase App Distribution

### عبر Firebase Console:

1. اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/appdistribution
2. اضغط "Get Started"
3. اتبع التعليمات لتفعيل الخدمة

### عبر Firebase CLI:

```bash
firebase init appdistribution
```

---

## 🔑 الخطوة 4: إنشاء Service Account Key

### عبر Firebase Console:

1. اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/settings/serviceaccounts/adminsdk
2. اضغط "Generate new private key"
3. احفظ الملف كـ `firebase-service-account.json` في مجلد المشروع
4. ⚠️ **مهم:** لا ترفع هذا الملف إلى Git!

---

## 📝 الخطوة 5: إعداد ملف البناء مع Firebase

سنقوم بإنشاء سكريبت لبناء التطبيق ورفعه إلى Firebase تلقائياً.

---

## 🎯 الاستخدام

بعد الإعداد، يمكنك:

1. **بناء APK:**
   ```bash
   cd android
   .\gradlew assembleRelease
   ```

2. **رفع إلى Firebase App Distribution:**
   ```bash
   firebase appdistribution:distribute android\app\build\outputs\apk\release\app-release.apk --app 1:37814615065:android:3b39b3622c8fbc0358fe88 --groups "testers" --release-notes "إصدار جديد"
   ```

---

## 📱 إضافة المختبرين

### عبر Firebase Console:

1. اذهب إلى Firebase Console > App Distribution
2. اضغط "Testers & Groups"
3. أضف مجموعة مختبرين
4. أضف أجهزة المختبرين (أو دعهم يسجلون أنفسهم)

### عبر CLI:

```bash
firebase appdistribution:groups:create testers
firebase appdistribution:testers:add testers tester@example.com
```

---

## 🔄 التكامل التلقائي مع EAS Build

يمكنك إعداد EAS Build لرفع التطبيق تلقائياً إلى Firebase بعد البناء.
