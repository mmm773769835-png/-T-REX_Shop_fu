import React, { createContext, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import { dbService, authService } from '../services/SupabaseService';

// Define types
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category?: string;
  attribute?: string;
}

interface WishListItem extends Product {
  addedAt: Date;
  price: number;
}

interface WishListState {
  items: WishListItem[];
  loading: boolean;
}

type WishListAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_WISHLIST'; payload: WishListItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: WishListState = {
  items: [],
  loading: false,
};

// Reducer
const wishListReducer = (state: WishListState, action: WishListAction): WishListState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        items: [...state.items, { ...action.payload, addedAt: new Date(), price: action.payload.price }],
      };
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
interface WishListContextType {
  state: WishListState;
  addToWishList: (product: Product) => Promise<void>;
  removeFromWishList: (productId: string) => Promise<void>;
  isInWishList: (productId: string) => boolean;
  loadWishList: () => Promise<void>;
}

const WishListContext = createContext<WishListContextType | undefined>(undefined);

// Provider component
export const WishListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishListReducer, initialState);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await authService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        loadWishList(user.id);
      } else {
        setUserId(null);
        dispatch({ type: 'SET_WISHLIST', payload: [] });
      }
    };

    checkUser();
  }, []);

  // Load wish list from Supabase
  const loadWishList = async (uid?: string) => {
    const currentUserId = uid || userId;
    if (!currentUserId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await dbService.get('wishlists', { eq: { user_id: currentUserId } });

      if (error) {
        console.error('❌ WishListContext: خطأ في تحميل قائمة الأمنيات:', error);
        return;
      }

      const items: WishListItem[] = [];

      if (data) {
        data.forEach((item: any) => {
          items.push({
            id: item.product_id,
            name: item.name,
            price: item.price,
            description: item.description,
            imageUrl: item.image_url,
            category: item.category,
            attribute: item.attribute,
            addedAt: new Date(item.added_at) || new Date(),
          });
        });
      }

      dispatch({ type: 'SET_WISHLIST', payload: items });
    } catch (error) {
      console.error('❌ WishListContext: خطأ في تحميل قائمة الأمنيات:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add product to wish list
  const addToWishList = async (product: Product) => {
    if (!userId) {
      console.warn('⚠️ WishListContext: المستخدم غير مسجل الدخول');
      return;
    }

    try {
      // Check if already in wish list
      if (state.items.some(item => item.id === product.id)) {
        console.log('ℹ️ WishListContext: المنتج موجود بالفعل في قائمة الأمنيات');
        return;
      }

      // Add to Firebase
      const wishlistData: any = {
        userId,
        productId: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        addedAt: new Date(),
      };

      // Only add optional fields if they exist
      if (product.category) {
        wishlistData.category = product.category;
      }
      if (product.attribute) {
        wishlistData.attribute = product.attribute;
      }

      // Add to Supabase
      const { error } = await dbService.add('wishlists', wishlistData);

      if (error) {
        console.error('❌ WishListContext: خطأ في إضافة المنتج إلى قائمة الأمنيات:', error);
        return;
      }

      // Update local state
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      console.log('✅ WishListContext: تم إضافة المنتج إلى قائمة الأمنيات');
    } catch (error) {
      console.error('❌ WishListContext: خطأ في إضافة المنتج إلى قائمة الأمنيات:', error);
    }
  };

  // Remove product from wish list
  const removeFromWishList = async (productId: string) => {
    if (!userId) {
      console.warn('⚠️ WishListContext: المستخدم غير مسجل الدخول');
      return;
    }

    try {
      // Find and delete from Supabase
      // First, find the wishlist item
      const { data, error: findError } = await dbService.get('wishlists', {
        eq: { user_id: userId, product_id: productId }
      });

      if (findError || !data || data.length === 0) {
        console.warn('⚠️ WishListContext: لم يتم العثور على العنصر في قائمة الأمنيات');
        return;
      }

      // Delete the wishlist item
      const { error: deleteError } = await dbService.delete('wishlists', data[0].id);

      if (deleteError) {
        console.error('❌ WishListContext: خطأ في حذف العنصر:', deleteError);
        return;
      }

      // Update local state
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      console.log('✅ WishListContext: تم إزالة المنتج من قائمة الأمنيات');
    } catch (error) {
      console.error('❌ WishListContext: خطأ في إزالة المنتج من قائمة الأمنيات:', error);
    }
  };

  // Check if product is in wish list
  const isInWishList = (productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  };

  return (
    <WishListContext.Provider
      value={{
        state,
        addToWishList,
        removeFromWishList,
        isInWishList,
        loadWishList,
      }}
    >
      {children}
    </WishListContext.Provider>
  );
};

// Custom hook to use wish list context
export const useWishList = () => {
  const context = useContext(WishListContext);
  
  if (context === undefined) {
    throw new Error('useWishList must be used within a WishListProvider');
  }
  
  return context;
};

export default WishListContext;
