# إعداد جدول أسعار الصرف في Supabase

## الخطوة 1: تشغيل SQL Migration

1. افتح لوحة تحكم Supabase: https://supabase.com/dashboard
2. اختر مشروعك: `udqnrsrwzifrzseixrcj`
3. اذهب إلى **SQL Editor** من القائمة الجانبية
4. انسخ محتوى الملف التالي والصقه في المحرر:
   - `supabase/migrations/create_currency_rates_table.sql`
5. انقر على **Run** لتنفيذ الاستعلام

## الخطوة 2: التحقق من الجدول

بعد تنفيذ الاستعلام، يمكنك التحقق من إنشاء الجدول:
1. اذهب إلى **Table Editor** من القائمة الجانبية
2. ابحث عن جدول `currency_rates`
3. تأكد من وجود البيانات التالية:
   - YER: 1.0
   - SAR: 140.20
   - USD: 535.00
   - AED: 143.00
   - EUR: 564.00
   - KWD: 1582.00
   - BHD: 1334.00
   - OMR: 1371.00

## الخطوة 3: تعديل الأسعار مستقبلاً

عندما تريد تعديل أسعار الصرف:
1. افتح لوحة تحكم Supabase
2. اذهب إلى **Table Editor**
3. اختر جدول `currency_rates`
4. عدل قيمة `rate` لأي عملة تريد
5. سيتم تحديث الأسعار تلقائياً في التطبيق والموقع عند فتحهما

## التغييرات التي تم إجراؤها في الكود

### 1. CurrencyContext.tsx (التطبيق)
- تم تحديث `fetchExchangeRates()` لجلب الأسعار من جدول `currency_rates` في Supabase
- تم الاحتفاظ بالأسعار اليدوية كـ fallback في حالة فشل الجلب

### 2. index.html (الموقع)
- تم تحديث `fetchExchangeRates()` لجلب الأسعار من endpoint `/api/exchange-rates/sanaa`
- يتم جلب الأسعار من Supabase عبر السيرفر

### 3. server/index.js (السيرفر)
- تم تحديث endpoint `/api/exchange-rates/sanaa` لجلب الأسعار من جدول `currency_rates` في Supabase
- يتم استخدام الأسعار اليدوية كـ fallback في حالة فشل الاتصال بـ Supabase

## المزايا

✅ **تحديث فوري**: عند تعديل الأسعار في Supabase، يتم تحديثها تلقائياً عند الزبائن
✅ **لا حاجة لتحديث التطبيق**: لا حاجة لرفع تحديث جديد لمتجر Play Store
✅ **إدارة مركزية**: يمكنك تعديل الأسعار من مكان واحد (Supabase Dashboard)
✅ **Fallback آمن**: في حالة فشل الاتصال بـ Supabase، يتم استخدام الأسعار اليدوية
