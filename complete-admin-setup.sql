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
-- لتمكين الوصول للجميع (مؤقتاً للتطوير):
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
