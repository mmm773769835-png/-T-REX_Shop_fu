import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export type Currency = 'YER' | 'USD' | 'SAR' | 'KWD' | 'AED' | 'EUR' | 'BHD' | 'OMR';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Rate relative to YER (base currency)
}

// Fallback manual rates (used if Supabase fetch fails)
// Base currency: YER (1 YER as base)
export const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', rate: 1.0 },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rate: 140.20 },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rate: 535.00 },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rate: 143.00 },
  { code: 'EUR', symbol: '€', name: 'يورو', rate: 564.00 },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', rate: 1582.00 },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني', rate: 1334.00 },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني', rate: 1371.00 },
];

const EXCHANGE_SELL_MARGIN = 0; // 0% - No extra margins

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyRates: CurrencyRate[];
  convertPrice: (price: number, targetCurrency?: Currency) => number;
  formatPrice: (price: number | string, targetCurrency?: Currency | string | null) => string;
  formatPriceWithSource: (price: number | string, sourceCurrency: Currency | string | null, targetCurrency?: Currency | string | null) => string;
  getCurrencySymbol: (targetCurrency?: Currency | string | null) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('YER');
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(DEFAULT_CURRENCY_RATES);

  // Fetch exchange rates from Supabase currency_rates table
  const fetchExchangeRates = async () => {
    try {
      // Clear any existing cache
      await AsyncStorage.removeItem('exchangeRates');
      
      // Fetch rates from Supabase currency_rates table
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) {
        console.warn('⚠️ Failed to fetch rates from Supabase:', error.message);
        // Use fallback manual rates
        const fallbackRates = DEFAULT_CURRENCY_RATES.map(rate => ({ ...rate }));
        setCurrencyRates(fallbackRates);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert Supabase data to CurrencyRate format
        const fetchedRates: CurrencyRate[] = data.map(item => ({
          code: item.code as Currency,
          symbol: item.symbol,
          name: item.name,
          rate: parseFloat(item.rate)
        }));
        
        setCurrencyRates(fetchedRates);
        console.log('✅ Fetched exchange rates from Supabase currency_rates table');
      } else {
        // No data in Supabase, use fallback rates
        const fallbackRates = DEFAULT_CURRENCY_RATES.map(rate => ({ ...rate }));
        setCurrencyRates(fallbackRates);
        console.log('⚠️ No data in currency_rates table, using fallback rates');
      }
    } catch (error) {
      console.warn('⚠️ Error fetching exchange rates:', error);
      
      // Use fallback rates if error occurs
      const fallbackRates = DEFAULT_CURRENCY_RATES.map(rate => ({ ...rate }));
      setCurrencyRates(fallbackRates);
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
    // If source is YER (base currency), divide by target rate
    // If source is not YER, first convert to YER then to target
    let convertedPrice: number;
    
    if (source === 'YER') {
      // Price is already in YER, convert to target currency
      convertedPrice = numericPrice / (targetRate?.rate || 1);
    } else if (target === 'YER') {
      // Convert from source to YER
      convertedPrice = numericPrice * (sourceRate?.rate || 1);
    } else {
      // Convert from source to YER, then to target
      const priceInYER = numericPrice * (sourceRate?.rate || 1);
      convertedPrice = priceInYER / (targetRate?.rate || 1);
    }

    // Apply sell margin if converting between different currencies (like the website)
    if (source !== target) {
      convertedPrice = convertedPrice * (1 + EXCHANGE_SELL_MARGIN);
    }

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
        currencyRates,
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
