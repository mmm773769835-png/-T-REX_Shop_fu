# تفعيل Firebase Storage

## المشكلة
Firebase Storage غير مفعّل في المشروع. يجب تفعيله أولاً قبل نشر القواعد.

## خطوات التفعيل

### 1. افتح Firebase Console
اذهب إلى: https://console.firebase.google.com/project/t-rex-5b17f/storage

### 2. اضغط على "Get Started" (ابدأ)
- ستظهر لك نافذة لإعداد Firebase Storage
- اختر "Start in production mode" أو "Start in test mode"
- **للاختبار السريع**: اختر "Start in test mode" (يسمح بالقراءة والكتابة للجميع)
- **للإنتاج**: اختر "Start in production mode" (يتطلب قواعد أمان)

### 3. اختر موقع Storage
- اختر أقرب موقع جغرافي (مثلاً: `us-central1` أو `europe-west1`)
- اضغط "Done"

### 4. بعد التفعيل
بعد تفعيل Firebase Storage، يمكنك نشر القواعد:

```bash
firebase deploy --only storage
```

## ملاحظات مهمة

### إذا اخترت "Test mode":
- سيتم تفعيل Storage مع قواعد اختبار (القراءة والكتابة للجميع)
- يمكنك نشر القواعد المحدثة لاحقاً

### إذا اخترت "Production mode":
- سيتم تفعيل Storage مع قواعد إنتاج (تتطلب مصادقة)
- يجب نشر القواعد المحدثة فوراً للسماح برفع الإيصالات

## التحقق من التفعيل
بعد التفعيل، ستظهر لك صفحة Firebase Storage في Console مع:
- مساحة التخزين المستخدمة
- قائمة الملفات
- إعدادات القواعد

## بعد التفعيل
1. انشر القواعد المحدثة:
   ```bash
   firebase deploy --only storage
   ```

2. جرّب رفع صورة إيصال في التطبيق

3. تحقق من أن الصورة تم رفعها في Firebase Console > Storage

