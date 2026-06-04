-- إضافة بيانات تجريبية لجدول exchange_rates
-- هذه البيانات للتجربة فقط

-- حذف البيانات القديمة (اختياري)
DELETE FROM exchange_rates;

-- إضافة البيانات التجريبية
INSERT INTO exchange_rates (currency_code, rate, timestamp, source) VALUES
    ('YER', 1.0, NOW(), 'manual'),
    ('SAR', 140.20, NOW(), 'manual'),
    ('USD', 535.00, NOW(), 'manual'),
    ('KWD', 1582.00, NOW(), 'manual'),
    ('JOD', 754.50, NOW(), 'manual'),
    ('AED', 143.00, NOW(), 'manual'),
    ('EUR', 564.00, NOW(), 'manual');

-- التحقق من البيانات
SELECT * FROM exchange_rates;
