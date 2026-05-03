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
  
  // التعامل مع الصور - دعم الصورة الواحدة القديمة ومصفوفة الصور الجديدة
  const productImages = currentProduct?.images || (currentProduct?.imageUrl ? [currentProduct.imageUrl] : []);
  console.log('📷 الصور المتاحة للمنتج:', productImages);
  console.log('📷 مؤشر الصورة الحالية:', currentImageIndex);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
        </Text>
        <TouchableOpacity onPress={handleToggleWishList} style={styles.wishlistButton}>
          <Ionicons 
            name={isInWishList(currentProduct?.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishList(currentProduct?.id) ? "#e91e63" : (isDarkMode ? "#fff" : "#333")} 
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
          <Text style={styles.productName}>{currentProduct.name}</Text>
          <View style={styles.priceContainer}>
            {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
              <>
                <Text style={styles.originalPrice}>{formatPrice(currentProduct.originalPrice, (currentProduct.currency || 'YER') as any)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    -{Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}%
                  </Text>
                </View>
              </>
            )}
            <Text style={styles.productPrice}>{formatPrice(currentProduct.price, (currentProduct.currency || 'YER') as any)}</Text>
          </View>
          <Text style={styles.productDescription}>{currentProduct.description}</Text>
          
          {currentProduct.category && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{currentProduct.category}</Text>
            </View>
          )}
          
          {currentProduct.attribute && (
            <View style={[styles.chip, styles.attributeChip]}>
              <Text style={styles.chipText}>{currentProduct.attribute}</Text>
            </View>
          )}
          
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonWrapper}>
              <Button 
                title={language === "ar" ? "🛒 إضافة إلى السلة" : "🛒 Add to Cart"} 
                onPress={handleAddToCart}
                variant="primary"
                block
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title={language === "ar" ? "✅ تأكيد الطلب" : "✅ Confirm Order"} 
                onPress={handleCheckout}
                variant="success"
                block
              />
            </View>
          </View>

          {/* Reviews Section */}
          <TouchableOpacity 
            style={styles.reviewsButton}
            onPress={() => navigation.navigate('Reviews', { product: currentProduct })}
          >
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>
                {language === "ar" ? "⭐ المراجعات" : "⭐ Reviews"}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.averageRating}>{getAverageRating(currentProduct.id).toFixed(1)}</Text>
                <Ionicons name="star" size={16} color="#FFD700" />
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentScroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 20,
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: colors.gold, // لون ذهبي للسعر
    fontWeight: "bold",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.primary, // لون ذهبي
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  attributeChip: {
    backgroundColor: colors.success,
  },
  chipText: {
    color: colors.buttonText, // نص داكن على خلفية ذهبية
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  buttonWrapper: {
    width: "100%",
  },
  // أنماط معرض الصور
  imageSwiper: {
    width: '100%',
    height: 300,
    backgroundColor: 'transparent',
  },
  imageSlide: {
    width: Dimensions.get('window').width,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    width: 20,
  },
  imageGallery: {
    padding: 10,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: colors.gold, // لون ذهبي للصورة النشطة
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  wishlistButton: {
    padding: 8,
  },
  reviewsButton: {
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 1,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 4,
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});