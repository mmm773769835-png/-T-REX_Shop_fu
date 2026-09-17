-- ================================================================
-- T-REX Shop: إضافة جميع الأعمدة المطلوبة لجدول profiles و products
-- نفِّذ هذا السكريبت كاملاً في Supabase → SQL Editor
-- ================================================================

-- 1. إضافة الأعمدة الناقصة في جدول profiles
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

-- 2. إضافة الأعمدة الناقصة في جدول products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS vendor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vendor_code  TEXT,
  ADD COLUMN IF NOT EXISTS views_count  INTEGER DEFAULT 0;

-- 3. دالة توليد vendor_code تلقائياً عند إنشاء تاجر
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS TRIGGER AS $
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
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_vendor_code ON public.profiles;
CREATE TRIGGER trigger_generate_vendor_code
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_vendor_code();

-- 4. دالة زيادة عداد المشاهدات
CREATE OR REPLACE FUNCTION public.increment_product_views(product_id UUID)
RETURNS VOID AS $
BEGIN
  UPDATE public.products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = product_id;
END;
$ LANGUAGE plpgsql;

-- 5. دالة جلب تقييم التاجر
CREATE OR REPLACE FUNCTION public.get_vendor_rating(v_vendor_id UUID)
RETURNS NUMERIC AS $
DECLARE avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0)
  INTO avg_rating
  FROM public.products
  WHERE vendor_id = v_vendor_id AND rating IS NOT NULL;
  RETURN ROUND(avg_rating, 1);
END;
$ LANGUAGE plpgsql;

-- 6. سياسات الأمان (RLS) لجدول profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_upsert" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.profiles;

-- السماح للجميع بالقراءة (لعرض بيانات التجار في المنتجات)
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

-- السماح للمستخدم بتحديث ملفه الشخصي فقط
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- السماح بالإدراج والتحديث (upsert) لأي مستخدم مُسجَّل
CREATE POLICY "profiles_authenticated_upsert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. سياسات الأمان (RLS) لجدول products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone"       ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can insert products"  ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can update products"  ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can delete products"  ON public.products;

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_vendor_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendor')
    )
  );

CREATE POLICY "products_vendor_update" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        role = 'admin' OR
        (role = 'vendor' AND products.vendor_id = auth.uid())
      )
    )
  );

CREATE POLICY "products_vendor_delete" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        role = 'admin' OR
        (role = 'vendor' AND products.vendor_id = auth.uid())
      )
    )
  );

-- 8. تحديث حسابات الأدمن القديمة تلقائياً
UPDATE public.profiles
SET role = 'admin', shop_name = COALESCE(shop_name, 'الإدارة الرئيسية T-REX'), vendor_code = 'VND-MAIN'
WHERE email = 'mmm773769835@gmail.com';

UPDATE public.profiles
SET role = 'admin', shop_name = COALESCE(shop_name, 'الإدارة الرئيسية T-REX'), vendor_code = 'VND-ADMIN2'
WHERE email = 'trexshopmax@gmail.com';

-- 9. إعادة تحميل السكيما
NOTIFY pgrst, 'reload schema';
