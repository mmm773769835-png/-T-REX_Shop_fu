-- إنشاء جدول exchange_rates لتخزين أسعار الصرف الحية
-- هذا الجدول سيتم تحديثه تلقائياً من exrye.com/sanaa كل يومين

CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE, -- رمز العملة (مثال: SAR, USD, EUR)
    rate DECIMAL(10, 2) NOT NULL, -- سعر الصرف بالريال اليمني
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- وقت آخر تحديث
    source VARCHAR(100) DEFAULT 'exrye.com/sanaa', -- مصدر السعر
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة تعليقات على الجدول والأعمدة
COMMENT ON TABLE exchange_rates IS 'جدول أسعار الصرف الحية من exrye.com/sanaa';
COMMENT ON COLUMN exchange_rates.currency_code IS 'رمز العملة (مثال: SAR, USD, EUR, KWD, JOD, AED)';
COMMENT ON COLUMN exchange_rates.rate IS 'سعر الصرف بالريال اليمني';
COMMENT ON COLUMN exchange_rates.timestamp IS 'وقت آخر تحديث السعر';
COMMENT ON COLUMN exchange_rates.source IS 'مصدر السعر (مثال: exrye.com/sanaa)';

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exchange_rates_updated_at
    BEFORE UPDATE ON exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- إدخال الأسعار الافتراضية
INSERT INTO exchange_rates (currency_code, rate, source) VALUES
    ('YER', 1.00, 'default'),
    ('SAR', 140.20, 'default'),
    ('USD', 535.00, 'default'),
    ('KWD', 1582.00, 'default'),
    ('JOD', 754.50, 'default'),
    ('AED', 143.00, 'default'),
    ('EUR', 564.00, 'default')
ON CONFLICT (currency_code) DO NOTHING;

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_code ON exchange_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_timestamp ON exchange_rates(timestamp DESC);

-- منح صلاحيات القراءة للجميع (يمكن تعديلها حسب الحاجة)
-- GRANT SELECT ON exchange_rates TO authenticated, anon;
