-- ===================================================
-- T-REX Shop: Multi-Vendor System & Privacy Migration SQL
-- ===================================================

-- 1. تحديث جدول الملفات الشخصية (profiles)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS vendor_code TEXT UNIQUE;

-- 2. تحديث جدول المنتجات (products)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_code TEXT,
ADD COLUMN IF NOT EXISTS vendor_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used'));

-- 3. تفعيل وحث تسلسل الأكواد للتجار لإنشاء vendor_code تلقائي عند إنشاء تاجر
CREATE OR REPLACE FUNCTION generate_vendor_code()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
BEGIN
  IF NEW.role = 'vendor' AND (NEW.vendor_code IS NULL OR NEW.vendor_code = '') THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_code FROM 5) AS INTEGER)), 1000) + 1
    INTO next_seq
    FROM public.profiles
    WHERE vendor_code LIKE 'VND-%';
    
    NEW.vendor_code := 'VND-' || next_seq;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_vendor_code ON public.profiles;
CREATE TRIGGER trigger_generate_vendor_code
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION generate_vendor_code();

-- 4. سياسات الأمان والحماية (RLS Policies for Products)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

-- سياسة الإضافة للمدير والتاجر
DROP POLICY IF EXISTS "Admins and Vendors can insert products" ON public.products;
CREATE POLICY "Admins and Vendors can insert products"
ON public.products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'vendor')
  )
);

-- سياسة التعديل: المدير يقدر يعدل أي منتج، والتاجر يعدل منتجاته فقط
DROP POLICY IF EXISTS "Admins and Vendors can update products" ON public.products;
CREATE POLICY "Admins and Vendors can update products"
ON public.products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'admin' OR 
      (profiles.role = 'vendor' AND products.vendor_id = auth.uid())
    )
  )
);

-- سياسة الحذف: المدير يحذف أي منتج، والتاجر يحذف منتجاته فقط
DROP POLICY IF EXISTS "Admins and Vendors can delete products" ON public.products;
CREATE POLICY "Admins and Vendors can delete products"
ON public.products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'admin' OR 
      (profiles.role = 'vendor' AND products.vendor_id = auth.uid())
    )
  )
);

NOTIFY pgrst, 'reload schema';
