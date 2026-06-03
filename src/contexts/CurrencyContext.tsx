import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'YER' | 'USD' | 'SAR' | 'KWD' | 'JOD' | 'AED' | 'EUR';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Rate relative to YER (base currency)
}

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', rate: 1 },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 0.015 },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 0.004 },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', rate: 0.0012 },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', rate: 0.004 },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rate: 0.015 },
  { code: 'EUR', symbol: '€', name: 'يورو', rate: 0.0038 },
];

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

  // Load currency from storage
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem('selectedCurrency') as Currency;
        if (storedCurrency && CURRENCY_RATES.some(r => r.code === storedCurrency)) {
          setCurrency(storedCurrency);
        }
      } catch (error) {
        console.error('Failed to load currency from storage:', error);
      }
    };
    loadCurrency();
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
    return CURRENCY_RATES.some(r => r.code === normalized) ? normalized : 'YER';
  };

  const convertPrice = (price: number, targetCurrency?: Currency): number => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = CURRENCY_RATES.find(r => r.code === target);
    if (!currencyRate) return price;
    return price * currencyRate.rate;
  };

  const formatPrice = (price: number | string, targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = CURRENCY_RATES.find(r => r.code === target);
    const symbol = currencyRate?.symbol || 'ر.ي';
    const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')) || 0;
    // Convert price from YER (base currency) to target currency
    // Note: Prices from Supabase are assumed to be in YER (base currency)
    const convertedPrice = numericPrice * (currencyRate?.rate || 1);
    return `${convertedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
  };

  const formatPriceWithSource = (price: number | string, sourceCurrency: Currency | string | null, targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const source = normalizeCurrency(sourceCurrency);
    const targetRate = CURRENCY_RATES.find(r => r.code === target);
    const sourceRate = CURRENCY_RATES.find(r => r.code === source);
    const symbol = targetRate?.symbol || 'ر.ي';
    const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/,/g, '')) || 0;
    
    // Convert price from source currency to target currency
    // First convert to YER (base currency), then to target currency
    const priceInYer = numericPrice / (sourceRate?.rate || 1);
    const convertedPrice = priceInYer * (targetRate?.rate || 1);
    
    return `${convertedPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
  };

  const getCurrencySymbol = (targetCurrency?: Currency | string | null): string => {
    const target = normalizeCurrency(targetCurrency);
    const currencyRate = CURRENCY_RATES.find(r => r.code === target);
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
