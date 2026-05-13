import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useWishList } from '../contexts/WishListContext';
import { useReviews } from '../contexts/ReviewsContext';
import Button from "../shared/components/Button";
import { sanitizeImageUrl, getDefaultProductImage } from '../utils/imageUtils';
import { dbService } from '../services/SupabaseService';

export default function ProductDetails({ route, navigation }: any) {
  // استقبال product من التنقل العادي أو productId من Deep Link
  const { product, productId } = route.params;
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(!!productId);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { addToWishList, removeFromWishList, isInWishList } = useWishList();
  const { loadReviews, getAverageRating, getReviewsByProduct } = useReviews();
  const [imageFailed, setImageFailed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const styles = getStyles(isDarkMode, colors);

  // Fetch المنتج من Supabase إذا تم استقبال productId
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          console.log('📦 ProductDetails: جاري جلب المنتج من Supabase، ID:', productId);
          const { data, error } = await dbService.get('products', { eq: { id: productId } });

          if (error) {
            console.error('❌ ProductDetails: خطأ في جلب المنتج:', error);
            Alert.alert(
              language === "ar" ? "خطأ" : "Error",
              language === "ar" ? "حدث خطأ في جلب المنتج" : "Error fetching product"
            );
            navigation.goBack();
            return;
          }

          if (data && data.length > 0) {
            const productData = { ...data[0] };
            setFetchedProduct(productData);
            console.log('✅ ProductDetails: تم جلب المنتج بنجاح');
          } else {
            console.error('❌ ProductDetails: المنتج غير موجود');
            Alert.alert(
              language === "ar" ? "خطأ" : "Error",
              language === "ar" ? "المنتج غير موجود" : "Product not found"
            );
            navigation.goBack();
          }
        } catch (error) {
          console.error('❌ ProductDetails: خطأ في جلب المنتج:', error);
          Alert.alert(
            language === "ar" ? "خطأ" : "Error",
            language === "ar" ? "حدث خطأ في جلب المنتج" : "Error fetching product"
          );
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [productId, navigation, language]);

  // استخدام المنتج الممرر مباشرة أو المنتج المجلوب من Firebase
  const currentProduct = product || fetchedProduct;

  // Load reviews when product is loaded
  useEffect(() => {
    if (currentProduct) {
      loadReviews(currentProduct.id);
    }
  }, [currentProduct]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>
          {language === "ar" ? "جاري تحميل المنتج..." : "Loading product..."}
        </Text>
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Ionicons name="alert-circle" size={60} color={colors.textSecondary} />
        <Text style={styles.loadingText}>
          {language === "ar" ? "المنتج غير موجود" : "Product not found"}
        </Text>
      </View>
    );
  }
  
  // التعامل مع الصور - دعم image_url من Supabase أيضاً
  const productImages = currentProduct?.images || 
    (currentProduct?.image_url ? [currentProduct.image_url] : 
    (currentProduct?.imageUrl ? [currentProduct.imageUrl] : []));
  const currentImage = imageFailed ? getDefaultProductImage() : sanitizeImageUrl(productImages[currentImageIndex] || productImages[0]);

  const handleAddToCart = () => {
    addToCart(currentProduct);
    
    Alert.alert(
      language === "ar" ? "✅ تم الإضافة" : "✅ Added",
      language === "ar" 
        ? "تم إضافة المنتج إلى السلة بنجاح!" 
        : "Product added to cart successfully!",
      [
        {
          text: language === "ar" ? "حسناً" : "OK",
        }
      ]
    );
  };

  const handleToggleWishList = () => {
    if (!currentProduct) return;
    
    if (isInWishList(currentProduct.id)) {
      removeFromWishList(currentProduct.id);
      Alert.alert(
        language === "ar" ? "✅ تم الإزالة" : "✅ Removed",
        language === "ar" 
          ? "تم إزالة المنتج من قائمة الأمنيات!" 
          : "Product removed from wishlist!",
        [
          {
            text: language === "ar" ? "حسناً" : "OK",
          }
        ]
      );
    } else {
      addToWishList(currentProduct);
      Alert.alert(
        language === "ar" ? "❤️ تم الإضافة" : "❤️ Added",
        language === "ar" 
          ? "تم إضافة المنتج إلى قائمة الأمنيات!" 
          : "Product added to wishlist!",
        [
          {
            text: language === "ar" ? "حسناً" : "OK",
          }
        ]
      );
    }
  };

  const handleCheckout = () => {

    
    // إضافة المنتج إلى السلة
    addToCart(currentProduct);

    
    // الانتقال إلى صفحة تأكيد الطلب
    try {
      
      
      // استخدام getParent() للوصول إلى Stack Navigator
      const stackNavigator = navigation.getParent();
      
      if (stackNavigator) {
        
        stackNavigator.navigate("OrderConfirm");
        
      } else {
        // الطريقة البديلة: استخدام navigate مباشرة
        
        navigation.navigate("OrderConfirm");
      }
    } catch (error) {
      console.error('❌ ProductDetails: خطأ في التنقل:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" 
          ? `حدث خطأ أثناء التنقل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `An error occurred while navigating: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
        </Text>
        <TouchableOpacity onPress={handleToggleWishList} style={styles.wishlistButton}>
          <Ionicons 
            name={isInWishList(currentProduct?.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishList(currentProduct?.id) ? "#FF3B3B" : "#FFD700"} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={productImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          setCurrentImageIndex(index);
        }}
        style={styles.imageSwiper}
        renderItem={({ item, index }: { item: string, index: number }) => (
          <View key={index} style={styles.imageSlide}>
            <Image
              source={{ uri: sanitizeImageUrl(item) }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      
      {/* مؤشرات الصور */}
      {productImages.length > 1 && (
        <View style={styles.imageIndicators}>
          {productImages.map((_: string, index: number) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentImageIndex === index && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}
      
      <ScrollView style={styles.contentScroll}>
        <View style={styles.productInfo}>
          {/* Name & Price */}
          <Text style={styles.productName}>{currentProduct.name}</Text>
          <View style={styles.priceContainer}>
            {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
              <>
                <Text style={styles.originalPrice}>
                  {(currentProduct.originalPrice).toLocaleString()} {currentProduct.currency === 'SAR' ? 'ر.س' : 'ر.ي'}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    -{Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}%
                  </Text>
                </View>
              </>
            )}
            <Text style={styles.productPrice}>
              {(currentProduct.price).toLocaleString()} {currentProduct.currency === 'SAR' ? 'ر.س' : 'ر.ي'}
            </Text>
          </View>

          {/* Category chip */}
          {currentProduct.category && (
            <View style={styles.chip}>
              <Ionicons name="pricetag-outline" size={12} color="#1a1a1a" />
              <Text style={styles.chipText}>{currentProduct.category}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.productDescription}>{currentProduct.description}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
              <Ionicons name="cart-outline" size={20} color="#1a1a1a" />
              <Text style={styles.cartBtnText}>
                {language === "ar" ? "إضافة للسلة" : "Add to Cart"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={handleCheckout}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.buyBtnText}>
                {language === "ar" ? "اطلب الآن" : "Order Now"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <TouchableOpacity 
            style={styles.reviewsButton}
            onPress={() => navigation.navigate('Reviews', { product: currentProduct })}
          >
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>
                {language === "ar" ? "المراجعات" : "Reviews"}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.averageRating}>{getAverageRating(currentProduct.id).toFixed(1)}</Text>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Ionicons name="chevron-forward" size={16} color="#888" />
              </View>
            </View>
            <Text style={styles.reviewsCount}>
              {getReviewsByProduct(currentProduct.id).length} {language === "ar" ? "مراجعة" : "reviews"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? "#111" : "#f0f0f0" },
  contentScroll: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 44, paddingBottom: 12,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1, borderBottomColor: "#2a2a2a",
  },
  backBtn: { padding: 6 },
  title: { fontSize: 17, fontWeight: "800", color: "#FFD700", letterSpacing: 1 },
  wishlistButton: { padding: 6 },
  productImage: { width: "100%", height: 300, resizeMode: "cover" },
  imageSwiper: { width: '100%', height: 300 },
  imageSlide: {
    width: Dimensions.get('window').width, height: 300,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: isDarkMode ? "#1a1a1a" : "#000",
  },
  imageIndicators: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: 10, gap: 6,
    backgroundColor: isDarkMode ? "#111" : "#f0f0f0",
  },
  indicator: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: isDarkMode ? "#444" : "#ccc",
  },
  activeIndicator: { backgroundColor: "#FFD700", width: 22, borderRadius: 4 },
  imageGallery: { padding: 10, backgroundColor: colors.surface },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginHorizontal: 5, borderWidth: 2, borderColor: 'transparent' },
  activeThumbnail: { borderColor: "#FFD700" },
  thumbnailImage: { width: '100%', height: '100%', borderRadius: 6 },
  productInfo: {
    padding: 18,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    margin: 14, borderRadius: 18,
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5,
  },
  productName: {
    fontSize: 20, fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 10, lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, flexWrap: 'wrap', gap: 8,
  },
  productPrice: { fontSize: 24, color: "#FFD700", fontWeight: "900" },
  originalPrice: {
    fontSize: 15, color: "#888",
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF3B3B',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  discountBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFD700",
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12,
    alignSelf: "flex-start", marginBottom: 12,
  },
  chipText: { color: "#1a1a1a", fontSize: 13, fontWeight: "700" },
  attributeChip: { backgroundColor: "#4CAF50" },
  productDescription: {
    fontSize: 15, color: isDarkMode ? "#bbb" : "#555",
    lineHeight: 24, marginBottom: 18,
  },
  buttonsContainer: {
    flexDirection: 'row', gap: 10, marginTop: 4,
  },
  cartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: "#FFD700", borderRadius: 14,
    paddingVertical: 14, gap: 6,
  },
  cartBtnText: { color: "#1a1a1a", fontWeight: "800", fontSize: 14 },
  buyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: "#25D366", borderRadius: 14,
    paddingVertical: 14, gap: 6,
  },
  buyBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  buttonWrapper: { width: "100%" },
  reviewsButton: {
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    padding: 14, marginTop: 16, borderRadius: 14,
  },
  reviewsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  reviewsTitle: { fontSize: 16, fontWeight: '700', color: isDarkMode ? "#fff" : "#1a1a1a" },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  averageRating: { fontSize: 16, fontWeight: '800', color: isDarkMode ? "#fff" : "#1a1a1a" },
  reviewsCount: { fontSize: 13, color: "#888" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.textSecondary },
});