-- ================================================================
-- T-REX Shop: نظام التسويق بالعمولة وبوابة المؤثرين (Affiliate & Influencer System)
-- قم بتشغيل هذا السكريبت كاملاً في Supabase -> SQL Editor
-- ================================================================

-- 1. جدول حسابات المؤثرين (influencers)
CREATE TABLE IF NOT EXISTS public.influencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_code VARCHAR(30) UNIQUE NOT NULL, -- مثل: AFF_X89K
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash TEXT, -- كلمة المرور المشفرة
    social_links JSONB DEFAULT '{}'::jsonb, -- روابط شبكات التواصل (تيك توك، إنستغرام، يوتيوب، الخ)
    payout_details JSONB DEFAULT '{}'::jsonb, -- تفاصيل الاستلام (بنكي، محفظة إلكترونية، صرافة)
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- نسبة العمولة الافتراضية
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول تتبع النقرات والزيارات (referral_clicks)
CREATE TABLE IF NOT EXISTS public.referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE,
    influencer_code VARCHAR(30),
    visitor_ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول محفظة المؤثر (influencer_wallets)
CREATE TABLE IF NOT EXISTS public.influencer_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    pending_balance DECIMAL(12, 2) DEFAULT 0.00,
    total_earned DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'SAR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول المبيعات والمنتجات المشتراة عبر الروابط (referral_orders)
CREATE TABLE IF NOT EXISTS public.referral_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE,
    influencer_code VARCHAR(30),
    order_id VARCHAR(100) NOT NULL,
    product_details JSONB DEFAULT '[]'::jsonb, -- تفاصيل المنتجات والأسعار
    order_total DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SAR',
    commission_status VARCHAR(20) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول طلبات سحب الأرباح (influencer_payout_requests)
CREATE TABLE IF NOT EXISTS public.influencer_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SAR',
    payout_method JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. إنشاء التريجر لتوليد المحفظة تلقائياً عند إنشاء مؤثر جديد
CREATE OR REPLACE FUNCTION public.create_influencer_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.influencer_wallets (influencer_id, balance, pending_balance, total_earned, currency)
    VALUES (NEW.id, 0.00, 0.00, 0.00, 'SAR')
    ON CONFLICT (influencer_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_influencer_wallet ON public.influencers;
CREATE TRIGGER trigger_create_influencer_wallet
AFTER INSERT ON public.influencers
FOR EACH ROW EXECUTE FUNCTION public.create_influencer_wallet();

-- 7. تفعيل سياسات الوصول (RLS Policies)
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payout_requests ENABLE ROW LEVEL SECURITY;

-- السماح بالوصول العام والقراءة/الكتابة لنظام العمولات
DROP POLICY IF EXISTS "influencers_allow_all" ON public.influencers;
CREATE POLICY "influencers_allow_all" ON public.influencers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "referral_clicks_allow_all" ON public.referral_clicks;
CREATE POLICY "referral_clicks_allow_all" ON public.referral_clicks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "influencer_wallets_allow_all" ON public.influencer_wallets;
CREATE POLICY "influencer_wallets_allow_all" ON public.influencer_wallets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "referral_orders_allow_all" ON public.referral_orders;
CREATE POLICY "referral_orders_allow_all" ON public.referral_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "payout_requests_allow_all" ON public.influencer_payout_requests;
CREATE POLICY "payout_requests_allow_all" ON public.influencer_payout_requests FOR ALL USING (true) WITH CHECK (true);

-- تحديث السكيما
NOTIFY pgrst, 'reload schema';
