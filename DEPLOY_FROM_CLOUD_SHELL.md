# نشر قواعد Firebase Storage من Cloud Shell

## الخطوات:

### 1. التأكد من تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. تسجيل الدخول إلى Firebase
```bash
firebase login --no-localhost
```
سيظهر لك رابط للدخول. افتح الرابط في المتصفح واتبع التعليمات.

### 3. التأكد من أنك في مجلد المشروع
إذا لم تكن في مجلد المشروع، قم بتحميل الملفات:
```bash
# إنشاء مجلد للمشروع
mkdir t-rex-shop
cd t-rex-shop

# تحميل ملفات المشروع (إذا كانت في GitHub)
# أو استخدم gcloud storage أو git clone
```

### 4. نسخ ملف storage.rules إلى Cloud Shell
إذا كان الملف محلياً، يمكنك رفعه:
- استخدم زر "Upload file" في Cloud Shell
- أو انسخ محتوى storage.rules وألصقه في ملف جديد

### 5. نشر القواعد
```bash
firebase deploy --only storage
```

## طريقة بديلة: استخدام gsutil

إذا كان Firebase CLI لا يعمل، يمكنك استخدام gsutil:

```bash
# تفعيل Storage API
gcloud services enable storage-component.googleapis.com

# رفع ملف القواعد مباشرة (إذا كان متاحاً)
# لكن الأفضل استخدام Firebase CLI
```

## ملاحظة
إذا لم تكن الملفات في Cloud Shell، يمكنك:
1. استخدام Git لاستنساخ المشروع
2. أو رفع الملفات يدوياً
3. أو نشر القواعد من جهازك المحلي

