-- Create currency_rates table for dynamic exchange rate management
-- This table allows updating exchange rates without app store updates

CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- Currency code (e.g., 'USD', 'SAR', 'YER')
  symbol TEXT NOT NULL, -- Currency symbol (e.g., '$', 'ر.س', 'ر.ي')
  name TEXT NOT NULL, -- Currency name in Arabic (e.g., 'دولار أمريكي', 'ريال سعودي')
  rate NUMERIC NOT NULL, -- Exchange rate relative to YER (base currency)
  is_active BOOLEAN DEFAULT true, -- Whether this currency is active
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_currency_rates_code ON currency_rates(code);

-- Create trigger for updated_at (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_currency_rates_updated_at ON currency_rates;
CREATE TRIGGER update_currency_rates_updated_at
  BEFORE UPDATE ON currency_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial currency rates (manual rates provided by user)
INSERT INTO currency_rates (code, symbol, name, rate, is_active) VALUES
  ('YER', 'ر.ي', 'ريال يمني', 1.0, true),
  ('SAR', 'ر.س', 'ريال سعودي', 140.20, true),
  ('USD', '$', 'دولار أمريكي', 535.00, true),
  ('AED', 'د.إ', 'درهم إماراتي', 143.00, true),
  ('EUR', '€', 'يورو', 564.00, true),
  ('KWD', 'د.ك', 'دينار كويتي', 1582.00, true),
  ('BHD', 'د.ب', 'دينار بحريني', 1334.00, true),
  ('OMR', 'ر.ع', 'ريال عماني', 1371.00, true)
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to currency_rates" ON currency_rates;
DROP POLICY IF EXISTS "Allow authenticated users to update currency_rates" ON currency_rates;

-- Create policy to allow public read access (for app and website)
CREATE POLICY "Allow public read access to currency_rates"
  ON currency_rates FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to update rates (for admin)
CREATE POLICY "Allow authenticated users to update currency_rates"
  ON currency_rates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
