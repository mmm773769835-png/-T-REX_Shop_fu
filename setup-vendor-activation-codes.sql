-- ===================================================
-- T-REX Shop: Vendor Activation Codes (30-Day Subscription) SQL Migration
-- ===================================================

-- 1. إضافة عمود تاريخ انتهاء التمييز في جدول الملفات الشخصية (profiles)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- 2. إنشاء جدول أكواد التفعيل (activation_codes)
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INT DEFAULT 30,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_by_vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. سياسات الأمان RLS لجدول أكواد التفعيل
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- سياسة الاستعلام للأكواد: المدير يستعرض الكل، والتاجر يستعلم عن كوده المتاح
DROP POLICY IF EXISTS "Admins can view all codes" ON public.activation_codes;
CREATE POLICY "Admins can view all codes"
ON public.activation_codes FOR SELECT
USING (true);

-- سياسة التعديل والإضافة للمدير فقط
DROP POLICY IF EXISTS "Admins can manage codes" ON public.activation_codes;
CREATE POLICY "Admins can manage codes"
ON public.activation_codes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

NOTIFY pgrst, 'reload schema';
