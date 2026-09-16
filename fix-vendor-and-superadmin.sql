-- ================================================================
-- T-REX Shop: إصلاح السكيما وتراخيص دليل التجار والمنتجات والأسعار
-- قم بتشغيل هذا السكريبت في Supabase SQL Editor
-- ================================================================

-- 1. التأكد من وجود جميع الأعمدة في جدول profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS name        TEXT,
  ADD COLUMN IF NOT EXISTS shop_name   TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS address     TEXT,
  ADD COLUMN IF NOT EXISTS vendor_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS role        TEXT DEFAULT 'customer'
    CHECK (role IN ('customer', 'vendor', 'admin')),
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

-- 2. التأكد من وجود أعمدة التجار والأسعار في جدول products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS vendor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vendor_code  TEXT,
  ADD COLUMN IF NOT EXISTS vendor_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS views_count  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hot       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS images       JSONB DEFAULT '[]'::jsonb;

-- 3. تحديث أسعار التجار الصافية للمنتجات الحالية في حال كانت مفقودة أو مساوية للسعر المعروض
UPDATE public.products
SET vendor_price = ROUND((price / 1.10)::numeric, 2)
WHERE vendor_price IS NULL OR vendor_price = price;

-- 4. تعيين كود التاجر افتراضي (VND-MAIN) للمنتجات التي لا تحتوي كود تاجر
UPDATE public.products
SET vendor_code = 'VND-MAIN'
WHERE vendor_code IS NULL OR vendor_code = '';

-- 5. دالة توليد vendor_code تلقائياً عند إنشاء تاجر جديد
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS TRIGGER AS $$
DECLARE next_seq INT;
BEGIN
  IF (NEW.vendor_code IS NULL OR NEW.vendor_code = '') THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_code FROM 5) AS INTEGER)), 1000) + 1
    INTO next_seq
    FROM public.profiles
    WHERE vendor_code LIKE 'VND-%'
      AND vendor_code != 'VND-MAIN'
      AND vendor_code ~ '^VND-[0-9]+$';
    NEW.vendor_code := 'VND-' || next_seq;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_vendor_code ON public.profiles;
CREATE TRIGGER trigger_generate_vendor_code
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_vendor_code();

-- 6. سياسات RLS لضمان إمكانية قراءة وعرض الملفات والتجار للجميع
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_authenticated_upsert" ON public.profiles;
CREATE POLICY "profiles_authenticated_upsert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. إعادة تحميل السكيما في Supabase
-- 7. سياسات RLS لجدول المنتجات لتسمح للتجار والمسؤولين بقراءة وإضافة والتعديل على منتجاتهم
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_authenticated_insert" ON public.products;
CREATE POLICY "products_authenticated_insert" ON public.products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "products_authenticated_update" ON public.products;
CREATE POLICY "products_authenticated_update" ON public.products
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "products_authenticated_delete" ON public.products;
CREATE POLICY "products_authenticated_delete" ON public.products
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 8. إعادة تحميل السكيما في Supabase
NOTIFY pgrst, 'reload schema';
