-- إضافة عمود rejection_reason لجدول المؤثرين في Supabase
-- لتخزين سبب عدم قبول حساب المؤثر (مثل عدد المتابعين أقل من 3,000 متابع)

ALTER TABLE IF EXISTS public.influencers 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT 'عدد المتابعين بحسابك أقل من الحد الأدنى المطلوب (3,000 متابع)';
