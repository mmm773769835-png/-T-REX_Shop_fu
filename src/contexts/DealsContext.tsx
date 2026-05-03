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
}

interface DealsContextType {
  state: DealsState;
  loadDeals: () => Promise<void>;
  getDealById: (dealId: string) => Deal | undefined;
}

// Initial state
const initialState: DealsState = {
  deals: [],
  loading: false,
};

// Create context
const DealsContext = createContext<DealsContextType | undefined>(undefined);

// Provider component
export const DealsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DealsState>(initialState);

  // Load deals from Firebase
  const loadDeals = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Get products with discount field from Supabase
      const { data, error } = await dbService.get('products', {
        gt: { discount: 0 },
        order: { column: 'discount', ascending: false },
        limit: 20
      });

      if (error) {
        console.error('❌ DealsContext: خطأ في تحميل العروض:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const deals: Deal[] = [];

      if (data) {
        data.forEach((item: any) => {
          if (item.discount && item.discount > 0) {
            deals.push({
              id: item.id,
              productId: item.id,
              name: item.name || '',
              price: item.price || 0,
              originalPrice: item.original_price || item.price || 0,
              discount: item.discount || 0,
              imageUrl: item.image_url || '',
              description: item.description || '',
              category: item.category,
              attribute: item.attribute,
              validUntil: item.valid_until ? new Date(item.valid_until) : undefined,
            });
          }
        });
      }

      setState({ deals, loading: false });
      console.log('✅ DealsContext: تم تحميل العروض بنجاح', deals.length);
    } catch (error) {
      console.error('❌ DealsContext: خطأ في تحميل العروض:', error);
      setState(prev => ({ ...prev, loading: false }));
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
