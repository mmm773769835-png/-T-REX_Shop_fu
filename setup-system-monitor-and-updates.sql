-- ==============================================================================
-- T-REX Shop: إعداد جداول مركز المراقبة والتحكم المباشر وتحديثات التطبيق
-- Run this script in Supabase -> SQL Editor
-- ==============================================================================

-- 1. جدول سجل الأخطاء الفورية للتطبيق والموقع (System Error Logs)
CREATE TABLE IF NOT EXISTS public.system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL, -- 'app' أو 'web'
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    screen_or_url TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'investigating', 'resolved'
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للبحث السريع وترتيب السجلات
CREATE INDEX IF NOT EXISTS idx_system_error_logs_created_at ON public.system_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_platform ON public.system_error_logs (platform);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_status ON public.system_error_logs (status);

-- تفعيل أمان الصفوف (RLS)
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_error_logs_insert" ON public.system_error_logs;
CREATE POLICY "system_error_logs_insert" ON public.system_error_logs 
    FOR INSERT WITH CHECK (true); -- السماح للتطبيق والموقع بتسجيل الأخطاء

DROP POLICY IF EXISTS "system_error_logs_select" ON public.system_error_logs;
CREATE POLICY "system_error_logs_select" ON public.system_error_logs 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "system_error_logs_update" ON public.system_error_logs;
CREATE POLICY "system_error_logs_update" ON public.system_error_logs 
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "system_error_logs_delete" ON public.system_error_logs;
CREATE POLICY "system_error_logs_delete" ON public.system_error_logs 
    FOR DELETE USING (true);


-- 2. جدول التحكم في تحديثات وإصدارات التطبيق (App Version Control & Broadcast)
CREATE TABLE IF NOT EXISTS public.app_version_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_name VARCHAR(50) NOT NULL, -- e.g. '1.2.0'
    version_code INT DEFAULT 1,         -- e.g. 12
    min_supported_version VARCHAR(50),  -- أقل إصدار مسموح به
    title VARCHAR(255) NOT NULL,        -- عنوان إشعار التحديث
    message TEXT NOT NULL,              -- تفاصيل ومميزات التحديث
    download_url TEXT NOT NULL,         -- رابط التحميل من المتجر أو APK
    is_force_update BOOLEAN DEFAULT false, -- تحديث إجباري يمنع فتح التطبيق
    is_active BOOLEAN DEFAULT true,     -- هل التحديث مفعل حالياً
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_version_control_created_at ON public.app_version_control (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_version_control_is_active ON public.app_version_control (is_active);

ALTER TABLE public.app_version_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_version_control_select" ON public.app_version_control;
CREATE POLICY "app_version_control_select" ON public.app_version_control 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_version_control_insert" ON public.app_version_control;
CREATE POLICY "app_version_control_insert" ON public.app_version_control 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "app_version_control_update" ON public.app_version_control;
CREATE POLICY "app_version_control_update" ON public.app_version_control 
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "app_version_control_delete" ON public.app_version_control;
CREATE POLICY "app_version_control_delete" ON public.app_version_control 
    FOR DELETE USING (true);


-- 3. تفعيل Realtime Publications للجداول لإرسال التحديثات اللحظية
DO $$
BEGIN
    -- إضافة جدول سجل الأخطاء إلى realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'system_error_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_error_logs;
    END IF;

    -- إضافة جدول التحديثات إلى realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'app_version_control'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_version_control;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not configure publications automatically: %', SQLERRM;
END $$;
