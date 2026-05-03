import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image: string;
  category: string;
  attribute?: string;
  payment_method?: string;
  currency?: string;
  discount?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // تحويل البيانات إلى الشكل المطلوب
        const formattedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          original_price: item.original_price,
          description: item.description,
          image: item.image || 'https://via.placeholder.com/300',
          category: item.category || 'general',
          attribute: item.attribute,
          payment_method: item.payment_method,
          currency: item.currency || 'OMR',
          discount: item.discount,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));

        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  // تحميل المنتجات عند بدء التطبيق
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // إعداد Real-time subscription للتزامن الفوري
  useEffect(() => {
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product change detected:', payload);
          // تحديث المنتجات عند أي تغيير
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  const getProductsByCategory = useCallback((category: string) => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  }, [products]);

  const value: ProductsContextType = {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    getProductById,
    getProductsByCategory,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
