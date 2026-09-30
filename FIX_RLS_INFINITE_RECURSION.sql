-- ================================================================
-- T-REX Shop: إصلاح مشكلة التكرار اللانهائي في سياسات الأمان (RLS Infinite Recursion Fix)
-- قم بتشغيل هذا السكريبت مباشرة في Supabase -> SQL Editor
-- ================================================================

-- 1. إنشاء دالة آمنة لفحص هل المستخدم مدير نظام لتجنب التكرار اللانهائي في السياسات (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. إزالة جميع السياسات القديمة المسببة للمشكلة على جدول profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_manage" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. إضافة سياسات جديدة نظيفة وبدون تكرار نهائياً لجدول profiles
-- سياسة القراءة للجميع
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

-- سياسة التعديل والإضافة والحذف للمستخدم نفسه أو مدير النظام
CREATE POLICY "profiles_self_manage" ON public.profiles
  FOR ALL
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. إزالة وتجديد السياسات على جدول المنتجات products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can update products" ON public.products;
DROP POLICY IF EXISTS "Admins and Vendors can delete products" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_manage_policy" ON public.products;

-- سياسة القراءة للمنتجات للجميع
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

-- سياسة الإضافة والتعديل والحذف للمنتجات
CREATE POLICY "products_manage_policy" ON public.products
  FOR ALL
  USING (auth.role() = 'authenticated' OR public.is_admin())
  WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());

-- 5. إبلاغ Supabase بتحديث المخطط فوراً
NOTIFY pgrst, 'reload schema';
