import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'YER' | 'USD' | 'SAR';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Rate relative to YER (base currency)
}

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', rate: 1 },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 0.004 },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 0.015 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number, targetCurrency?: Currency) => number;
  formatPrice: (price: number, targetCurrency?: Currency) => string;
  getCurrencySymbol: (targetCurrency?: Currency) => string;
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

  const convertPrice = (price: number, targetCurrency?: Currency): number => {
    const target = targetCurrency || currency;
    const currencyRate = CURRENCY_RATES.find(r => r.code === target);
    if (!currencyRate) return price;
    return price * currencyRate.rate;
  };

  const formatPrice = (price: number, targetCurrency?: Currency): string => {
    const target = targetCurrency || currency;
    const currencyRate = CURRENCY_RATES.find(r => r.code === target);
    const symbol = currencyRate?.symbol || 'ر.ي';
    // إذا كانت العملة محددة، عرض السعر كما هو بدون تحويل
    // لأن المستخدم يدخل السعر بالعملة المختارة مباشرة
    return `${price.toFixed(2)} ${symbol}`;
  };

  const getCurrencySymbol = (targetCurrency?: Currency): string => {
    const target = targetCurrency || currency;
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
