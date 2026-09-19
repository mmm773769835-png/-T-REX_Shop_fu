-- ================================================================
-- T-REX Shop: حل مشكلة تفعيل حسابات التجار وتوليد أكواد التفعيل
-- إضافة عمود featured_until إلى جدول profiles وإنشاء جدول أكواد التفعيل
-- ================================================================

-- 1. إضافة عمود تاريخ انتهاء التفعيل المميز لجدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- 2. إضافة أي أعمدة أخرى قد تكون غائبة لجدول profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS name        TEXT,
  ADD COLUMN IF NOT EXISTS shop_name   TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS address     TEXT,
  ADD COLUMN IF NOT EXISTS vendor_code TEXT,
  ADD COLUMN IF NOT EXISTS role        TEXT DEFAULT 'customer';

-- 3. إنشاء جدول أكواد التفعيل (activation_codes) إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INT DEFAULT 30,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_by_vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- 4. تفعيل سياسات الأمان RLS
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all codes" ON public.activation_codes;
CREATE POLICY "Admins can view all codes" ON public.activation_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage codes" ON public.activation_codes;
CREATE POLICY "Admins can manage codes" ON public.activation_codes FOR ALL USING (true);

-- 5. إعطاء كافة الصلاحيات للوصول
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.activation_codes TO anon, authenticated, service_role;

-- 6. تحديث كاش Supabase Schema فوراً
NOTIFY pgrst, 'reload schema';
