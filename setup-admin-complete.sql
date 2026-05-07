-- ============================================
-- إنشاء جدول Admin + إضافة المستخدم
-- ============================================

-- الخطوة 1: إنشاء جدول profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ملاحظة مهمة:
-- بعد تشغيل هذا السكريبت، اذهب إلى:
-- Authentication → Users
-- وانسخ User ID الخاص بـ trexshopmax@gmail.com
-- ثم شغل الأمر التالي (استبدل YOUR_USER_ID بالـ ID الحقيقي):
--
-- INSERT INTO public.profiles (id, email, role)
-- VALUES ('YOUR_USER_ID', 'trexshopmax@gmail.com', 'admin');
-- ============================================
