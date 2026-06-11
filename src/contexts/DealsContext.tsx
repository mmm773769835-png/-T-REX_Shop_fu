import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbService } from '../services/SupabaseService';

// Define types
interface Deal {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number; // النسبة المئوية
  imageUrl: string;
  description: string;
  category?: string;
  attribute?: string;
  validUntil?: Date;
}

interface DealsState {
  deals: Deal[];
  loading: boolean;
  error: string | null;
}

interface DealsContextType {
  state: DealsState;
  loadDeals: () => Promise<void>;
  getDealById: (dealId: string) => Deal | undefined;
  clearError: () => void;
}

// Initial state
const initialState: DealsState = {
  deals: [],
  loading: false,
  error: null,
};

// Create context
const DealsContext = createContext<DealsContextType | undefined>(undefined);

// Provider component
export const DealsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DealsState>(initialState);

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Load deals from Firebase
  const loadDeals = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get products that have original_price (discounted products)
      const { data, error } = await dbService.get('products', {
        order: { column: 'created_at', ascending: false },
        limit: 20
      });

      if (error) {
        console.error('❌ DealsContext: خطأ في تحميل العروض:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message || 'Failed to load deals' }));
        return;
      }

      const deals: Deal[] = [];

      if (data) {
        data.forEach((item: any) => {
          // منتجات العروض هي التي لها سعر أصلي أعلى من السعر الحالي
          if (item.original_price && item.original_price > item.price) {
            const discountPercent = Math.round((1 - item.price / item.original_price) * 100);
            deals.push({
              id: item.id,
              productId: item.id,
              name: item.name || '',
              price: item.price || 0,
              originalPrice: item.original_price || item.price || 0,
              discount: discountPercent,
              imageUrl: item.image_url || '',
              description: item.description || '',
              category: item.category,
              attribute: item.attribute,
              validUntil: undefined,
            });
          }
        });
      }

      setState({ deals, loading: false, error: null });
      console.log('✅ DealsContext: تم تحميل العروض بنجاح', deals.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load deals';
      console.error('❌ DealsContext: خطأ في تحميل العروض:', error);
      setState(prev => ({ ...prev, loading: false, error: message }));
    }
  };

  // Get deal by ID
  const getDealById = (dealId: string): Deal | undefined => {
    return state.deals.find(deal => deal.id === dealId);
  };

  // Load deals on mount
  useEffect(() => {
    loadDeals();
  }, []);

  return (
    <DealsContext.Provider
      value={{
        state,
        loadDeals,
        getDealById,
        clearError,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
};

// Custom hook to use deals context
export const useDeals = () => {
  const context = useContext(DealsContext);
  
  if (context === undefined) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  
  return context;
};

export default DealsContext;
