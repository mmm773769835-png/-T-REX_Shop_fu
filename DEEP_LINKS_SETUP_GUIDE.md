# دليل إعداد Deep Links لتطبيق T-REX Shop

## ✅ الإعدادات المكتملة

### 1. Android
تم إعداد Deep Links بنجاح في:
- `android/app/src/main/AndroidManifest.xml` - تم إضافة intent-filter لـ `trexshop://`
- `app.json` - تم إضافة intentFilters في قسم android

### 2. iOS
تم إعداد Deep Links في:
- `app.json` - تم إضافة:
  - `associatedDomains`: `applinks:trex-shop.com`
  - `CFBundleURLSchemes`: `trexshop`

### 3. ملف apple-app-site-association
تم إنشاء الملف: `apple-app-site-association`

## 📋 الخطوات المتبقية

### خطوة 1: الحصول على Team ID من Apple
1. سجل الدخول إلى [Apple Developer Portal](https://developer.apple.com/account/)
2. انتقل إلى Membership
3. انسخ Team ID (مثال: `ABC123XYZ`)

### خطوة 2: تحديث ملف apple-app-site-association
استبدل `TEAMID` في الملف بـ Team ID الخاص بك:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["ABC123XYZ.com.trexshop.app"],
        "components": [
          {
            "/": "/product/*",
            "comment": "Matches any product page"
          }
        ]
      }
    ]
  }
}
```

### خطوة 3: رفع الملف إلى خادم الويب
يجب رفع الملف إلى: `https://trex-shop.com/.well-known/apple-app-site-association`

**المتطلبات:**
- الملف يجب أن يكون JSON بدون امتداد
- لا يجب أن يحتوي على BOM
- يجب أن يكون accessible عبر HTTPS
- يجب أن يكون Content-Type: `application/json`

### خطوة 4: إعادة بناء التطبيق
بعد إكمال الإعدادات، أعد بناء التطبيق:

```bash
# لـ iOS
eas build --platform ios

# لـ Android
eas build --platform android
```

### خطوة 5: اختبار Deep Links

#### اختبار على Android:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "trexshop://product/PRODUCT_ID" com.trexshop.app
```

#### اختبار على iOS:
1. افتح Safari على جهاز iOS
2. اكتب: `trexshop://product/PRODUCT_ID`
3. يجب أن يفتح التطبيق

#### اختبار من الواتساب:
1. أرسل رسالة واتساب تحتوي على: `trexshop://product/PRODUCT_ID`
2. اضغط على الرابط
3. يجب أن يفتح التطبيق

## 🔗 أمثلة الروابط

### Universal Link (الموصى به - يفتح التطبيق أو الويب):
```
https://trex-shop.com/product/abc123
```

### Custom URL Scheme (للاستخدام الداخلي فقط):
```
trexshop://product/abc123
```

**ملاحظة:** نستخدم Universal Links (https://) في رسائل الواتساب لأنها:
- ✅ تعمل حتى إذا لم يكن التطبيق مثبتًا (تفتح الويب)
- ✅ أكثر أماناً (تتطلب مصافحة رقمية)
- ✅ توفر تجربة مستخدم أفضل

## 📝 ملاحظات مهمة

1. **للويب**: إذا كنت تستخدم Firebase Hosting، يمكنك رفع الملف إلى Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

2. **للاختبار المحلي**: يمكنك استخدام Expo Go لاختبار Deep Links:
   ```bash
   expo install expo-linking
   ```

3. **للإنتاج**: تأكد من أن نطاق `trex-shop.com` accessible عبر HTTPS

## ✨ الميزات المضافة

- ✅ روابط المنتجات في رسائل الواتساب
- ✅ صور المنتجات في الرسائل
- ✅ فتح المنتجات مباشرة من الواتساب
- ✅ دعم Deep Links و Universal Links
