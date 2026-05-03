# حل مشكلة البناء على Windows

## ❌ المشكلة
EAS Build المحلي (`--local`) لا يدعم Windows. يعمل فقط على macOS و Linux.

---

## ✅ الحلول البديلة على Windows

### 1️⃣ استخدام Expo Run (موصى به) ✅

هذا الحل **يعمل على Windows** ويمكنه بناء APK:

```bash
npx expo run:android --variant release
```

**المتطلبات:**
- Android Studio مثبت
- Android SDK مثبت
- جهاز Android متصل أو محاكي

**الخطوات:**
1. تأكد من تثبيت Android Studio
2. افتح Android Studio وثبت Android SDK
3. شغّل الأمر أعلاه

---

### 2️⃣ استخدام Gradle مباشرة

بعد تشغيل `npx expo prebuild` مرة واحدة:

```bash
# إنشاء مجلد android إذا لم يكن موجوداً
npx expo prebuild --platform android

# البناء باستخدام Gradle
cd android
.\gradlew assembleRelease

# ملف APK سيكون في:
# android\app\build\outputs\apk\release\app-release.apk
```

---

### 3️⃣ استخدام WSL2 (Windows Subsystem for Linux)

إذا كان لديك WSL2 مثبتاً:

```bash
# في WSL2
eas build --platform android --profile preview --local
```

---

### 4️⃣ استخدام GitHub Actions (مجاني)

إعداد GitHub Actions للبناء التلقائي (يعمل على Linux):

1. إنشاء ملف `.github/workflows/build.yml`
2. رفع الكود إلى GitHub
3. البناء سيتم تلقائياً على خوادم GitHub

---

### 5️⃣ الانتظار 13 يوم

الحد الشهري سيعود في 1 فبراير 2026.

---

## 🚀 التوصية السريعة

**للحصول على APK فوراً على Windows:**

```bash
# 1. تأكد من تثبيت Android Studio
# 2. شغّل هذا الأمر:
npx expo run:android --variant release
```

هذا سينشئ APK يمكنك تثبيته على أي جهاز Android.
