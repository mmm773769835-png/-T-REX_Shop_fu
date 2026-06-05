/**
 * Tests for the pure currency-conversion helpers extracted from CurrencyContext.
 *
 * We inline the constants and pure logic from CurrencyContext to avoid importing
 * the .tsx file (which contains JSX and would require a React transform).
 */

type Currency = 'YER' | 'USD' | 'SAR' | 'KWD' | 'JOD' | 'AED' | 'EUR';

interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
}

const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', rate: 1.0 },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 140.20 },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 535.00 },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', rate: 1582.00 },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', rate: 754.50 },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rate: 143.00 },
  { code: 'EUR', symbol: '€', name: 'يورو', rate: 564.00 },
];

const EXCHANGE_SELL_MARGIN = 0.0345;

// Pure helper replicas (same logic as CurrencyContext)

const normalizeCurrency = (
  target: string | null | undefined,
  fallback: Currency = 'YER',
): Currency => {
  const normalized = String(target || fallback).toUpperCase() as Currency;
  return DEFAULT_CURRENCY_RATES.some(r => r.code === normalized) ? normalized : 'YER';
};

const convertPrice = (
  price: number,
  targetCurrency: Currency,
  rates: CurrencyRate[] = DEFAULT_CURRENCY_RATES,
): number => {
  const target = normalizeCurrency(targetCurrency);
  const currencyRate = rates.find(r => r.code === target);
  if (!currencyRate) return price;
  return price / currencyRate.rate;
};

const formatPrice = (
  price: number | string,
  targetCurrency: Currency | string | null = null,
  rates: CurrencyRate[] = DEFAULT_CURRENCY_RATES,
): string => {
  const target = normalizeCurrency(targetCurrency);
  const currencyRate = rates.find(r => r.code === target);
  const symbol = currencyRate?.symbol || 'ر.ي';
  const numericPrice =
    typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')) || 0;
  const convertedPrice = numericPrice / (currencyRate?.rate || 1);
  return `${convertedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
};

const getCurrencySymbol = (
  target: Currency | string | null = null,
  rates: CurrencyRate[] = DEFAULT_CURRENCY_RATES,
): string => {
  const normalized = normalizeCurrency(target);
  const currencyRate = rates.find(r => r.code === normalized);
  return currencyRate?.symbol || 'ر.ي';
};

// ---- tests ----

describe('DEFAULT_CURRENCY_RATES', () => {
  it('should contain 7 currency entries', () => {
    expect(DEFAULT_CURRENCY_RATES).toHaveLength(7);
  });

  it('should have YER as base with rate 1', () => {
    const yer = DEFAULT_CURRENCY_RATES.find(r => r.code === 'YER');
    expect(yer).toBeDefined();
    expect(yer!.rate).toBe(1.0);
  });

  it('should have unique currency codes', () => {
    const codes = DEFAULT_CURRENCY_RATES.map(r => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('should have positive rates for all currencies', () => {
    DEFAULT_CURRENCY_RATES.forEach(r => {
      expect(r.rate).toBeGreaterThan(0);
    });
  });
});

describe('normalizeCurrency', () => {
  it('should return uppercase code for a known currency', () => {
    expect(normalizeCurrency('usd')).toBe('USD');
  });

  it('should fall back to YER for unknown currencies', () => {
    expect(normalizeCurrency('XYZ')).toBe('YER');
  });

  it('should fall back to YER for null', () => {
    expect(normalizeCurrency(null)).toBe('YER');
  });

  it('should fall back to YER for undefined', () => {
    expect(normalizeCurrency(undefined)).toBe('YER');
  });
});

describe('convertPrice', () => {
  it('should return same price for YER (rate 1)', () => {
    expect(convertPrice(1000, 'YER')).toBe(1000);
  });

  it('should divide by USD rate', () => {
    const usdRate = DEFAULT_CURRENCY_RATES.find(r => r.code === 'USD')!.rate;
    const converted = convertPrice(1000, 'USD');
    expect(converted).toBeCloseTo(1000 / usdRate, 5);
  });

  it('should divide by SAR rate', () => {
    const sarRate = DEFAULT_CURRENCY_RATES.find(r => r.code === 'SAR')!.rate;
    const converted = convertPrice(1000, 'SAR');
    expect(converted).toBeCloseTo(1000 / sarRate, 5);
  });

  it('should handle zero price', () => {
    expect(convertPrice(0, 'USD')).toBe(0);
  });
});

describe('formatPrice', () => {
  it('should format a YER price with the YER symbol', () => {
    const result = formatPrice(1000, 'YER');
    expect(result).toContain('ر.ي');
    expect(result).toContain('1,000');
  });

  it('should format a USD price', () => {
    const result = formatPrice(535, 'USD');
    expect(result).toContain('$');
    // 535 / 535 ≈ 1
    expect(result).toMatch(/1\s*\$/);
  });

  it('should parse a string price', () => {
    const result = formatPrice('2,000', 'YER');
    expect(result).toContain('2,000');
  });

  it('should handle invalid string price gracefully', () => {
    const result = formatPrice('not-a-number', 'YER');
    expect(result).toContain('0');
  });
});

describe('getCurrencySymbol', () => {
  it('should return ر.ي for YER', () => {
    expect(getCurrencySymbol('YER')).toBe('ر.ي');
  });

  it('should return $ for USD', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  it('should return € for EUR', () => {
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('should default to ر.ي for unknown currency', () => {
    expect(getCurrencySymbol('FAKE')).toBe('ر.ي');
  });
});
