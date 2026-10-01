-- ================================================================
-- T-REX Shop: إضافة وتأكيد عمود كود المؤثر (influencer_code) في Supabase
-- قم بتشغيل هذا السكريبت في Supabase -> SQL Editor
-- ================================================================

-- 1. إضافة عمود influencer_code لجدول المبيعات العامة (orders) إن وجد
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS influencer_code VARCHAR(50);
    END IF;
END $$;

-- 2. تأكيد وتحديث عمود influencer_code لجدول إحالات المؤثرين (referral_orders)
ALTER TABLE IF EXISTS public.referral_orders 
ADD COLUMN IF NOT EXISTS influencer_code VARCHAR(50);

-- 3. تحديث الفهارس (Indexes) لسرعة البحث والاستعلام بكود المؤثر
CREATE INDEX IF NOT EXISTS idx_referral_orders_influencer_code 
ON public.referral_orders (influencer_code);

-- 4. إتاحة جميع الصلاحيات للجداول لضمان وصول الطلبات دون أي قيود RLS
ALTER TABLE IF EXISTS public.referral_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_orders_allow_all" ON public.referral_orders;
CREATE POLICY "referral_orders_allow_all" ON public.referral_orders FOR ALL USING (true) WITH CHECK (true);
