-- ===================================================
-- T-REX Shop: Enforce Required Vendor Name & Phone SQL Trigger
-- ===================================================

-- 1. التأكد من توفر الأعمدة الحاوية لبيانات التاجر
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- 2. إنشاء دالة التحقق من إلزامية اسم التاجر ورقم الهاتف عند الحفظ أو التعديل
CREATE OR REPLACE FUNCTION validate_vendor_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق فقط عندما يكون نوع الحساب تاجر
  IF NEW.role = 'vendor' THEN
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
      RAISE EXCEPTION '❌ اسم التاجر / الاسم الكامل إجباري للحساب التجاري';
    END IF;

    IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
      RAISE EXCEPTION '❌ رقم الهاتف إجباري للحساب التجاري';
    END IF;
    
    IF NEW.shop_name IS NULL OR TRIM(NEW.shop_name) = '' THEN
      RAISE EXCEPTION '❌ اسم المتجر إجباري للحساب التجاري';
    END IF;

    IF NEW.address IS NULL OR TRIM(NEW.address) = '' THEN
      RAISE EXCEPTION '❌ العنوان إجباري للحساب التجاري';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ربط التريجر بجدول الملفات الشخصية profiles
DROP TRIGGER IF EXISTS trigger_validate_vendor_profile ON public.profiles;

CREATE TRIGGER trigger_validate_vendor_profile
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION validate_vendor_profile();

NOTIFY pgrst, 'reload schema';
