-- ============================================
-- إنشاء Trigger لإضافة Profile تلقائياً
-- ============================================

-- إنشاء function لإنشاء profile عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- إضافة Admin يدوياً
-- ============================================
-- ملاحظة: استبدل YOUR_USER_ID بالـ ID الحقيقي من:
-- Authentication → Users → trexshopmax@gmail.com

-- مثال (استبدل الـ ID):
-- INSERT INTO public.profiles (id, email, role)
-- VALUES ('اكتب_الـ_ID_هنا', 'trexshopmax@gmail.com', 'admin');

-- ============================================
-- Row Level Security for profiles table
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins have full access
CREATE POLICY "Admins have full access"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
