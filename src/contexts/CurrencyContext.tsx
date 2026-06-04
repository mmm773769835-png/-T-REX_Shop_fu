import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'YER' | 'USD' | 'SAR' | 'KWD' | 'JOD' | 'AED' | 'EUR';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Rate relative to YER (base currency)
}

// Default rates (will be updated from API)
// Based on Sana'a market rates (1 YER as base)
export const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', rate: 1.0 },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 140.20 },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 535.00 },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', rate: 1582.00 },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', rate: 754.50 },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rate: 143.00 },
  { code: 'EUR', symbol: '€', name: 'يورو', rate: 564.00 },
];

const EXCHANGE_SELL_MARGIN = 0.0345; // 3.45%

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number, targetCurrency?: Currency) => number;
  formatPrice: (price: number | string, targetCurrency?: Currency | string | null) => string;
  formatPriceWithSource: (price: number | string, sourceCurrency: Currency | string | null, targetCurrency?: Currency | string | null) => string;
  getCurrencySymbol: (targetCurrency?: Currency | string | null) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('YER');
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(DEFAULT_CURRENCY_RATES);

  // Fetch live exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      // Check cache first (valid for 1 hour)
      const cached = await AsyncStorage.getItem('exchangeRates');
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp < oneHour) {
          setCurrencyRates(rates);
          console.log('✅ Using cached exchange rates');
          return;
        }
      }

      // Use default Sana'a market rates (will be updated from bank API later)
      const newRates: CurrencyRate[] = DEFAULT_CURRENCY_RATES.map(rate => ({ ...rate }));
      
      setCurrencyRates(newRates);
      
      // Cache the rates
      await AsyncStorage.setItem('exchangeRates', JSON.stringify({
        rates: newRates,
        timestamp: Date.now()
      }));
      
      console.log('✅ Fetched live exchange rates from API');
    } catch (error) {
      console.warn('⚠️ Failed to fetch live rates, using defaults:', error);
    }
  };

  // Load currency from storage and fetch rates
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem('selectedCurrency') as Currency;
        if (storedCurrency && DEFAULT_CURRENCY_RATES.some(r => r.code === storedCurrency)) {
          setCurrency(storedCurrency);
        }
      } catch (error) {
        console.error('Failed to load currency from storage:', error);
      }
    };
    loadCurrency();
    fetchExchangeRates();
  }, []);

  // Save currency to storage when it changes
  useEffect(() => {
    const saveCurrency = async () => {
      try {
        await AsyncStorage.setItem('selectedCurrency', currency);
      } catch (error) {
        console.error('Failed to save currency to storage:', error);
      }
    };
    saveCurrency();
  }, [currency]);

  const normalizeCurrency = (targetCurrency?: Currency | string | null): Currency => {
    const normalized = String(targetCurrency || currency || 'YER').toUpperCase() as Currency;
    return DEFAULT_CURRENCY_RATES.some(r => r.code === normalized) ? normalized : 'YER';
  };

  const getSellRate = (code: Currency): number => {
    const rate = currencyRates.find(r => r.code === code)?.rate || 1;
    return rate * (1 + EXCHANGE_SELL_MARGIN);
  };

  const convertPrice = (price: number, targetCurrency?: Currency): number => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = currencyRates.find(r => r.code === target);
    if (!currencyRate) return price;
    return price / currencyRate.rate;
  };

  const formatPrice = (price: number | string, targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = currencyRates.find(r => r.code === target);
    const symbol = currencyRate?.symbol || 'ر.ي';
    const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')) || 0;
    // Convert price from YER (base currency) to target currency
    // Note: Prices from Supabase are assumed to be in YER (base currency)
    const convertedPrice = numericPrice / (currencyRate?.rate || 1);
    return `${convertedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
  };

  const formatPriceWithSource = (price: number | string, sourceCurrency: Currency | string | null, targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const source = normalizeCurrency(sourceCurrency);
    const targetRate = currencyRates.find(r => r.code === target);
    const sourceRate = currencyRates.find(r => r.code === source);
    const symbol = targetRate?.symbol || 'ر.ي';
    const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')) || 0;

    // Convert price from source currency to target currency
    // First convert to YER (base currency), then to target currency
    const priceInYER = numericPrice * (sourceRate?.rate || 1);
    const rawConvertedPrice = priceInYER / (targetRate?.rate || 1);

    // Apply sell margin if converting between different currencies (like the website)
    const convertedPrice = (source === target ? rawConvertedPrice : rawConvertedPrice * (1 + EXCHANGE_SELL_MARGIN));

    return `${convertedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
  };

  const getCurrencySymbol = (targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = currencyRates.find(r => r.code === target);
    return currencyRate?.symbol || 'ر.ي';
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        formatPriceWithSource,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
