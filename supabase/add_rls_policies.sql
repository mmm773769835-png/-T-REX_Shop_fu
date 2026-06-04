-- إضافة RLS policies لجدول exchange_rates
-- السماح للجميع بقراءة الأسعار
-- السماح للـ service role بالكتابة

-- تفعيل RLS على الجدول
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy للسماح للجميع بقراءة الأسعار (للتطبيق والموقع)
CREATE POLICY "Allow public read access to exchange_rates"
ON exchange_rates FOR SELECT
USING (true);

-- Policy للسماح للـ service role بالكتابة (لـ Edge Function)
CREATE POLICY "Allow service role to write exchange_rates"
ON exchange_rates FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- أو بدلاً من ذلك، يمكنك استخدام anon key للكتابة:
-- CREATE POLICY "Allow anon to write exchange_rates"
-- ON exchange_rates FOR ALL
-- USING (auth.role() = 'anon')
-- WITH CHECK (auth.role() = 'anon');
