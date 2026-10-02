-- ================================================================
-- T-REX Shop: جدول البث المباشر والإشعارات الفورية للموقع والتطبيق
-- Run this script in Supabase -> SQL Editor
-- ================================================================

-- 1. Create store_notifications table for push/broadcast notifications
CREATE TABLE IF NOT EXISTS public.store_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    badge_tag VARCHAR(100) DEFAULT 'إشعار جديد 🔔',
    link TEXT,
    icon TEXT,
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'vendors', 'influencers'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.store_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_notifications_select_all" ON public.store_notifications;
CREATE POLICY "store_notifications_select_all" ON public.store_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_notifications_insert_all" ON public.store_notifications;
CREATE POLICY "store_notifications_insert_all" ON public.store_notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "store_notifications_update_all" ON public.store_notifications;
CREATE POLICY "store_notifications_update_all" ON public.store_notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "store_notifications_delete_all" ON public.store_notifications;
CREATE POLICY "store_notifications_delete_all" ON public.store_notifications FOR DELETE USING (true);

-- 3. Create index for fast time ordering
CREATE INDEX IF NOT EXISTS idx_store_notifications_created_at ON public.store_notifications (created_at DESC);

-- 4. Enable Supabase Realtime for store_notifications publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'store_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store_notifications;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add to publication automatically: %', SQLERRM;
END $$;
