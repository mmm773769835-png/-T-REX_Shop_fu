-- ================================================================
-- T-REX Shop: سكريبت تثبيت وإصلاح صلاحيات مدير النظام (Super Admin)
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor
-- ================================================================

-- 1. التأكد من وجود الأعمدة اللازمة في جدول profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS name        TEXT,
  ADD COLUMN IF NOT EXISTS shop_name   TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS address     TEXT,
  ADD COLUMN IF NOT EXISTS vendor_code TEXT,
  ADD COLUMN IF NOT EXISTS role        TEXT DEFAULT 'customer'
    CHECK (role IN ('customer', 'vendor', 'admin')),
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- 2. ترقية الحسابات المحددة إلى مدير النظام (Super Admin) وتفريغ أكواد التاجر وتعيين اسمها كمدير نظام
UPDATE public.profiles
SET 
  role = 'admin',
  name = 'مدير النظام الرئيسي',
  vendor_code = NULL,
  shop_name = 'الإدارة الرئيسية T-REX',
  updated_at = NOW()
WHERE LOWER(TRIM(email)) IN (
  'mmm773769835@gmail.com',
  'trexshopmax@gmail.com',
  'mmm712874799@gmail.com'
);

-- 3. مزامنة البريد والاسم والحالة في حال وجود حساب في auth.users
UPDATE public.profiles p
SET 
  email = u.email,
  role = 'admin',
  vendor_code = NULL,
  name = 'مدير النظام الرئيسي',
  shop_name = 'الإدارة الرئيسية T-REX'
FROM auth.users u
WHERE p.id = u.id 
  AND LOWER(TRIM(u.email)) IN ('mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com');

-- 4. إدراج ملفات شخصية للمدراء إذا لم تكن موجودة في جدول profiles
INSERT INTO public.profiles (id, email, name, role, shop_name, updated_at)
SELECT 
  id,
  email,
  'مدير النظام الرئيسي',
  'admin',
  'الإدارة الرئيسية T-REX',
  NOW()
FROM auth.users
WHERE LOWER(TRIM(email)) IN ('mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com')
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  name = 'مدير النظام الرئيسي',
  shop_name = 'الإدارة الرئيسية T-REX',
  vendor_code = NULL,
  updated_at = NOW();

-- 5. تحديث دالة توليد كود التاجر لتنطبق حصراً على التجار فقط (role = 'vendor')
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS TRIGGER AS $$
DECLARE next_seq INT;
BEGIN
  IF NEW.role = 'vendor' AND (NEW.vendor_code IS NULL OR NEW.vendor_code = '') THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_code FROM 5) AS INTEGER)), 1000) + 1
    INTO next_seq
    FROM public.profiles
    WHERE vendor_code LIKE 'VND-%'
      AND vendor_code != 'VND-MAIN'
      AND vendor_code ~ '^VND-[0-9]+$';
    NEW.vendor_code := 'VND-' || next_seq;
  ELSIF NEW.role = 'admin' THEN
    NEW.vendor_code := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_vendor_code ON public.profiles;
CREATE TRIGGER trigger_generate_vendor_code
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_vendor_code();

-- 6. تحديث سياسات الأمان RLS لجدول profiles لضمان القراءة الكاملة وإتاحة التحكم للأدمن
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. إعادة تحميل السكيما في Supabase
NOTIFY pgrst, 'reload schema';
