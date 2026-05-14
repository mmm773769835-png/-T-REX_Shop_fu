import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useWishList } from '../contexts/WishListContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { sanitizeImageUrl } from '../utils/imageUtils';

const WishlistScreen = ({ navigation }: any) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  const { state, removeFromWishList } = useWishList();
  const { addToCart } = useCart();

  const styles = getStyles(isDarkMode);

  const handleRemoveFromWishlist = (id: string, name: string) => {
    Alert.alert(
      language === "ar" ? "❌ إزالة من المفضلة" : "❌ Remove from Wishlist",
      language === "ar" ? `هل تريد إزالة "${name}" من المفضلة؟` : `Remove "${name}" from wishlist?`,
      [
        { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "إزالة" : "Remove",
          style: "destructive",
          onPress: () => removeFromWishList(id)
        }
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    Alert.alert(
      language === "ar" ? "✅ تمت الإضافة" : "✅ Added",
      language === "ar" ? `تم إضافة "${item.name}" للسلة` : `"${item.name}" added to cart`,
      [{ text: language === "ar" ? "حسناً" : "OK" }]
    );
  };

  const handleOrderNow = (item: any) => {
    // Add to cart first then go to order confirmation
    addToCart(item);
    navigation.navigate('OrderConfirm');
  };

  const handleViewProduct = (item: any) => {
    navigation.navigate('ProductDetails', { product: item });
  };

  const handleAddAllToCart = () => {
    if (state.items.length === 0) return;
    
    state.items.forEach((item: any) => addToCart(item));
    Alert.alert(
      language === "ar" ? "✅ تمت الإضافة" : "✅ Added",
      language === "ar" ? `تم إضافة ${state.items.length} منتجات للسلة` : `${state.items.length} products added to cart`,
      [{ text: language === "ar" ? "حسناً" : "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Dark Gold */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="heart" size={28} color="#FFD700" />
          <Text style={styles.title}>
            {language === "ar" ? "المفضلة" : "Wishlist"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{state.items.length}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {state.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={60} color="#FFD700" />
          </View>
          <Text style={styles.emptyTitle}>
            {language === "ar" ? "المفضلة فارغة" : "Wishlist is empty"}
          </Text>
          <Text style={styles.emptyText}>
            {language === "ar" ? "اضغط ❤️ على المنتجات لإضافتها هنا" : "Tap ❤️ on products to add them here"}
          </Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate("MainTabs")}>
            <Text style={styles.browseButtonText}>
              {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#111" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Add All Button */}
            <TouchableOpacity style={styles.addAllButton} onPress={handleAddAllToCart}>
              <Ionicons name="cart" size={20} color="#111" />
              <Text style={styles.addAllButtonText}>
                {language === "ar" ? `إضافة الكل للسلة (${state.items.length})` : `Add All to Cart (${state.items.length})`}
              </Text>
            </TouchableOpacity>

            {/* Wishlist Items */}
            {state.items.map((item: any, index: number) => (
              <View key={item.id} style={[styles.wishlistItem, index === state.items.length - 1 && { marginBottom: 100 }]}>
                {/* Product Image */}
                <TouchableOpacity onPress={() => handleViewProduct(item)} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: sanitizeImageUrl(item.image_url || (item.images?.[0]) || item.imageUrl || 'https://via.placeholder.com/150') }} 
                    style={styles.itemImage} 
                    resizeMode="cover"
                  />
                  {item.is_new && (
                    <View style={styles.badgeNew}>
                      <Text style={styles.badgeText}>جديد</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Product Info */}
                <View style={styles.itemDetails}>
                  <TouchableOpacity onPress={() => handleViewProduct(item)}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category || 'منتج'}</Text>
                  </TouchableOpacity>

                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price, (item.currency || 'YER') as any)}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    {/* Add to Cart */}
                    <TouchableOpacity style={styles.cartBtn} onPress={() => handleAddToCart(item)}>
                      <Ionicons name="cart-outline" size={18} color="#FFD700" />
                      <Text style={styles.cartBtnText}>
                        {language === "ar" ? "السلة" : "Cart"}
                      </Text>
                    </TouchableOpacity>

                    {/* Order Now - Green WhatsApp Style */}
                    <TouchableOpacity style={styles.orderBtn} onPress={() => handleOrderNow(item)}>
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={styles.orderBtnText}>
                        {language === "ar" ? "اطلب الآن" : "Order Now"}
                      </Text>
                    </TouchableOpacity>

                    {/* Remove */}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFromWishlist(item.id, item.name)}>
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomOrderBtn} onPress={() => navigation.navigate('OrderConfirm')}>
              <Ionicons name="bag-check" size={22} color="#111" />
              <Text style={styles.bottomOrderText}>
                {language === "ar" ? "إتمام الشراء" : "Complete Purchase"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    padding: 6,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  addAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addAllButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
  },
  wishlistItem: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
  },
  badgeNew: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 17,
    color: "#FFD700",
    fontWeight: "800",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cartBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD700",
  },
  orderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 6,
  },
  orderBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(244,67,54,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },
  bottomOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFD700",
    borderRadius: 14,
    paddingVertical: 14,
  },
  bottomOrderText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
});

export default WishlistScreen;
