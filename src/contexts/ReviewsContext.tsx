import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbService, storageService } from '../services/SupabaseService';

// Define types
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  video?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
}

interface ReviewsContextType {
  state: ReviewsState;
  loadReviews: (productId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>, images?: File[], video?: File) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getReviewsByProduct: (productId: string) => Review[];
  getAverageRating: (productId: string) => number;
}

// Initial state
const initialState: ReviewsState = {
  reviews: [],
  loading: false,
};

// Create context
const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Provider component
export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ReviewsState>(initialState);

  // Upload image to Supabase Storage
  const uploadImage = async (file: Blob, path: string): Promise<string> => {
    try {
      const { error } = await storageService.upload('review-images', path, file);

      if (error) {
        console.error('❌ ReviewsContext: خطأ في رفع الصورة:', error);
        throw error;
      }

      const downloadURL = storageService.getPublicUrl('review-images', path);
      return downloadURL;
    } catch (error) {
      console.error('❌ ReviewsContext: خطأ في رفع الصورة:', error);
      throw error;
    }
  };

  // Upload video to Supabase Storage
  const uploadVideo = async (file: Blob, path: string): Promise<string> => {
    try {
      const { error } = await storageService.upload('review-videos', path, file);

      if (error) {
        console.error('❌ ReviewsContext: خطأ في رفع الفيديو:', error);
        throw error;
      }

      const downloadURL = storageService.getPublicUrl('review-videos', path);
      return downloadURL;
    } catch (error) {
      console.error('❌ ReviewsContext: خطأ في رفع الفيديو:', error);
      throw error;
    }
  };

  // Load reviews from Supabase
  const loadReviews = async (productId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await dbService.get('reviews', { eq: { product_id: productId } });

      if (error) {
        // جدول reviews غير موجود بعد - تجاهل الخطأ بهدوء
        setState(prev => ({ ...prev, loading: false, reviews: [] }));
        return;
      }

      const reviews: Review[] = [];

      if (data) {
        data.forEach((item: any) => {
          reviews.push({
            id: item.id,
            productId: item.product_id,
            userId: item.user_id,
            userName: item.user_name,
            rating: item.rating,
            comment: item.comment,
            images: item.images || [],
            video: item.video,
            createdAt: new Date(item.created_at) || new Date(),
            updatedAt: new Date(item.updated_at) || new Date(),
          });
        });
      }

      // Sort reviews by createdAt in descending order
      reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setState({ reviews, loading: false });
      console.log('✅ ReviewsContext: تم تحميل المراجعات بنجاح', reviews.length);
    } catch (error) {
      console.error('❌ ReviewsContext: خطأ في تحميل المراجعات:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Add review
  const addReview = async (
    review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>,
    images?: File[],
    video?: File
  ) => {
    try {
      const imageUrls: string[] = [];
      
      // Upload images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const path = `reviews/${review.productId}/${Date.now()}_image_${i}`;
          const url = await uploadImage(images[i], path);
          imageUrls.push(url);
        }
      }

      // Upload video
      let videoUrl: string | undefined;
      if (video) {
        const path = `reviews/${review.productId}/${Date.now()}_video`;
        videoUrl = await uploadVideo(video, path);
      }

      const reviewData = {
        product_id: review.productId,
        user_id: review.userId,
        user_name: review.userName,
        rating: review.rating,
        comment: review.comment,
        images: imageUrls,
        video: videoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await dbService.add('reviews', reviewData);

      if (error) {
        throw error;
      }
      
      // Reload reviews for this product
      await loadReviews(review.productId);
      
      console.log('✅ ReviewsContext: تم إضافة المراجعة بنجاح');
    } catch (error) {
      console.error('❌ ReviewsContext: خطأ في إضافة المراجعة:', error);
      throw error;
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await dbService.delete('reviews', reviewId);

      if (error) {
        throw error;
      }

      // Reload reviews
      const review = state.reviews.find(r => r.id === reviewId);
      if (review) {
        await loadReviews(review.productId);
      }

      console.log('✅ ReviewsContext: تم حذف المراجعة بنجاح');
    } catch (error) {
      console.error('❌ ReviewsContext: خطأ في حذف المراجعة:', error);
      throw error;
    }
  };

  // Get reviews by product
  const getReviewsByProduct = (productId: string): Review[] => {
    return state.reviews.filter(review => review.productId === productId);
  };

  // Get average rating
  const getAverageRating = (productId: string): number => {
    const productReviews = getReviewsByProduct(productId);
    if (productReviews.length === 0) return 0;
    
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / productReviews.length) * 10) / 10;
  };

  return (
    <ReviewsContext.Provider
      value={{
        state,
        loadReviews,
        addReview,
        deleteReview,
        getReviewsByProduct,
        getAverageRating,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

// Custom hook to use reviews context
export const useReviews = () => {
  const context = useContext(ReviewsContext);
  
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  
  return context;
};

export default ReviewsContext;
