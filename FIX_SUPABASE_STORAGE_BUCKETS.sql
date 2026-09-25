-- ==========================================================
-- T-REX Shop: Fix Supabase Storage Buckets & Public Permissions
-- ==========================================================

-- 1. إنشاء/تعديل الحاويات (Buckets) لتكون عامة لجميع المستخدمين
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. إزالة أي سياسات سابقة تقيد الرفع
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete for product images" ON storage.objects;

-- 3. تفعيل سياسات الوصول والرفع العامة (للجميع وبدون قيود)
CREATE POLICY "Allow public select for product images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'products'));

CREATE POLICY "Allow public insert for product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('product-images', 'products'));

CREATE POLICY "Allow public update for product images"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('product-images', 'products'));

CREATE POLICY "Allow public delete for product images"
ON storage.objects FOR DELETE
USING (bucket_id IN ('product-images', 'products'));
