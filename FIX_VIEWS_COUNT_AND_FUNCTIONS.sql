-- =========================================================================
-- T-REX SHOP - FIX PRODUCT VIEWS COUNT & RPC FUNCTIONS
-- =========================================================================

-- 1. Ensure views_count column exists on public.products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
UPDATE public.products SET views_count = 0 WHERE views_count IS NULL;

-- 2. Create function supporting TEXT parameter for string/UUID IDs
CREATE OR REPLACE FUNCTION public.increment_product_views(product_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id::text = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create overloaded function supporting UUID parameter (if IDs are stored as UUIDs)
CREATE OR REPLACE FUNCTION public.increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_product_views(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_product_views(UUID) TO anon, authenticated, service_role;

-- 5. Force schema cache refresh
NOTIFY pgrst, 'reload schema';
