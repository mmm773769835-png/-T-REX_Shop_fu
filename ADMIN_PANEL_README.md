# 🦖 T-REX Shop - دليل لوحة التحكم

## 🔗 روابط الوصول

| الصفحة | الرابط |
|--------|--------|
| **لوحة التحكم** | `https://www.trexshopmax.com/admin.html` |
| **المتجر** | `https://www.trexshopmax.com` |

---

## 🎯 كيف تعمل لوحة التحكم؟

### 1️⃣ تسجيل الدخول (Authentication)
```
🔐 البريد الإلكتروني: admin@trexshop.com
🔑 كلمة المرور: [الرقم السري]
```

**عملية التسجيل:**
1. يدخل المشرف بريده وكلمة المرور
2. يتم التحقق من Supabase Auth
3. يتم التحقق من صلاحية `role = admin` في جدول `profiles`
4. عند النجاح، يتم توجيهه للوحة التحكم

---

### 2️⃣ إضافة منتج جديد

**الخطوات:**
```
➕ اضغط على "إضافة منتج جديد"
   ↓
📝 املأ البيانات:
   • اسم المنتج (مثال: iPhone 15 Pro)
   • السعر (مثال: 999.99)
   • السعر الأصلي (اختياري - للخصم)
   • الفئة (إلكترونيات، ملابس، إلخ)
   • العملة (OMR، SAR، AED، USD)
   • رابط الصورة (https://...)
   • الوصف (اختياري)
   ↓
💾 اضغط "إضافة المنتج"
   ↓
✅ يتم الحفظ في Supabase تلقائياً
```

**البيانات المرسلة للسيرفر:**
```javascript
{
  name: "iPhone 15 Pro",
  price: 999.99,
  original_price: 1099.99,  // للخصم
  category: "إلكترونيات",
  currency: "OMR",
  image_url: "https://example.com/image.jpg",
  description: "أحدث هاتف من آبل...",
  is_new: true,
  rating: 0,
  review_count: 0,
  created_at: "2025-01-15T10:30:00Z"
}
```

---

### 3️⃣ تعديل منتج

**الخطوات:**
```
✏️ اضغط على زر "تعديل" بجانب المنتج
   ↓
📝 تعدل البيانات في النموذج
   ↓
💾 اضغط "حفظ التعديلات"
   ↓
✅ يتم التحديث في Supabase
```

**كود التحديث:**
```javascript
// React + Supabase
const { error } = await supabase
  .from('products')
  .update(productData)
  .eq('id', productId);
```

---

### 4️⃣ حذف منتج

**الخطوات:**
```
🗑️ اضغط على زر "حذف"
   ↓
⚠️ تأكيد العملية (هل أنت متأكد؟)
   ↓
✅ يتم الحذف من Supabase
   ↓
🔄 تحديث القائمة تلقائياً
```

**كود الحذف:**
```javascript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

---

## 🏗️ هيكل التطبيق (Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel (React)                   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Login      │  │   Product    │  │   Product    │   │
│  │   Screen     │  │    Form      │  │    List      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│           │                 │                │           │
│           └────────────────┼────────────────┘           │
│                            │                            │
│           ┌────────────────▼────────────────┐           │
│           │      Supabase Client (SDK)        │           │
│           │   ┌──────────────────────────┐   │           │
│           │   │  Auth (JWT Tokens)       │   │           │
│           │   │  Database (PostgreSQL)   │   │           │
│           │   │  Storage (Images)        │   │           │
│           │   └──────────────────────────┘   │           │
│           └──────────────────────────────────┘           │
│                            │                            │
│                            ▼                            │
│           ┌──────────────────────────────────┐           │
│           │      Supabase Cloud Server       │           │
│           │   https://udqnrsrwzifrzseixrcj.  │           │
│           │         supabase.co              │           │
│           └──────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 الأمان (Security)

### 1. المصادقة (Authentication)
```javascript
// Supabase Auth مع JWT Tokens
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@trexshop.com',
  password: 'password'
});

// يتم إنشاء JWT Token تلقائياً
// التوكن صالح لمدة محددة ثم يتجدد
```

### 2. التراخيص (Authorization)
```javascript
// التحقق من دور المستخدم
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  // رفض الوصول
  await supabase.auth.signOut();
}
```

### 3. RLS Policies (Row Level Security)
```sql
-- في Supabase، هذه السياسات تحمي البيانات:

-- السماح للمشرفين بالكتابة
CREATE POLICY "Allow admin write" ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- السماح للجميع بالقراءة
CREATE POLICY "Allow public read" ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

---

## 📊 قاعدة البيانات (Database Schema)

### جدول المنتجات (products)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  currency VARCHAR(3) DEFAULT 'OMR',
  is_new BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### جدول المستخدمين (profiles)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',  -- 'admin' أو 'user'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| **React 18** | واجهة المستخدم |
| **Supabase** | قاعدة البيانات + Auth |
| **PostgreSQL** | تخزين البيانات |
| **JWT** | المصادقة |
| **CSS3** | التصميم المتجاوب |
| **Vercel** | الاستضافة |

---

## 📱 خطوات الاستخدام السريعة

### للمشرف:
```bash
1. افتح: https://www.trexshopmax.com/admin.html
2. سجل الدخول ببيانات المشرف
3. اضغط "إضافة منتج جديد"
4. املأ البيانات واضغط "إضافة"
5. شاهد المنتج يظهر في المتجر فوراً!
```

### للعميل:
```bash
1. افتح: https://www.trexshopmax.com
2. تصفح المنتجات المضافة
3. اختر العملة المناسبة
4. أضف للسلة واشتري!
```

---

## ⚡ المميزات

✅ **تشغيل فوري** - المنتج يظهر في المتجر مباشرة
✅ **آمن** - محمي بـ JWT + RLS Policies
✅ **سريع** - Supabase سريع جداً
✅ **سهل** - واجهة بسيطة وواضحة
✅ **مجاني** - استخدام مجاني لـ Supabase (حتى 500K req/month)

---

## 🆘 استكشاف الأخطاء

### مشكلة: لا يمكن تسجيل الدخول
**الحل:**
- تأكد من بيانات المشرف في Supabase
- تحقق من `role = 'admin'` في جدول `profiles`

### مشكلة: المنتجات لا تظهر في المتجر
**الحل:**
- تأكد من اتصال Supabase
- تحقق من إعدادات RLS Policies
- راجع Network Tab في DevTools

### مشكلة: لا يمكن إضافة منتج
**الحل:**
- تأكد من تسجيل الدخول كمشرف
- تحقق من صلاحيات الكتابة في RLS

---

## 📞 للدعم

في حالة وجود مشاكل:
1. راجع Console في المتصفح (F12)
2. تحقق من Network Tab
3. تأكد من إعدادات Supabase

**تم إنشاء هذا التطبيق بواسطة T-REX Shop © 2025** 🦖
