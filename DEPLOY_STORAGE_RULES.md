# نشر قواعد Firebase Storage

## المشكلة
قواعد Firebase Storage الحالية تتطلب مصادقة لرفع الملفات، لكن الطلبات قد تتم بدون تسجيل دخول.

## الحل
تم تحديث قواعد Firebase Storage للسماح برفع صور الإيصالات في مجلد `receipts/` بدون مصادقة.

## خطوات النشر

### 1. التأكد من تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. تسجيل الدخول إلى Firebase
```bash
firebase login
```

### 3. نشر قواعد Storage
```bash
firebase deploy --only storage
```

أو لنشر كل شيء:
```bash
firebase deploy
```

## ملاحظات
- بعد نشر القواعد، سيتمكن المستخدمون من رفع صور الإيصالات بدون تسجيل دخول
- القواعد الجديدة تسمح بالقراءة والكتابة في مجلد `receipts/` للجميع
- باقي المجلدات تتطلب مصادقة للكتابة

## التحقق من النشر
بعد النشر، يمكنك التحقق من القواعد في:
1. Firebase Console
2. Storage > Rules
3. التأكد من أن القواعد المحدثة موجودة

