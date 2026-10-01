-- ================================================================
-- T-REX Shop: جدول تقييمات المتجر العامة (Store Reviews Table)
-- قم بتشغيل هذا السكريبت في Supabase -> SQL Editor
-- ================================================================

-- 1. إنشاء جدول store_reviews لحفظ التقييمات العامة للمتجر
CREATE TABLE IF NOT EXISTS public.store_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name VARCHAR(150) NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. إتاحة جميع الصلاحيات العامة (RLS Policies) للقراءة والإضافة للجميع
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_reviews_select_all" ON public.store_reviews;
CREATE POLICY "store_reviews_select_all" ON public.store_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_reviews_insert_all" ON public.store_reviews;
CREATE POLICY "store_reviews_insert_all" ON public.store_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "store_reviews_update_all" ON public.store_reviews;
CREATE POLICY "store_reviews_update_all" ON public.store_reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "store_reviews_delete_all" ON public.store_reviews;
CREATE POLICY "store_reviews_delete_all" ON public.store_reviews FOR DELETE USING (true);

-- 3. إنشاء الفهرس لتسريع القراءة حسب الترتيب الزمني
CREATE INDEX IF NOT EXISTS idx_store_reviews_created_at ON public.store_reviews (created_at DESC);
