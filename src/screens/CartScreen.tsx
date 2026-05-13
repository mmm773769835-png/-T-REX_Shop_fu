import React, { useContext } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../shared/components/Button";
import { ThemeContext } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

const CartScreen = ({ route, navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  const { state, removeFromCart, updateQuantity } = useCart();
  
  // استخدام CartContext بدلاً من route.params
  const cartItems = state.items;
  const total = state.total;
  
  const styles = getStyles(isDarkMode, colors);

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleCheckout = () => {

    
    if (cartItems.length === 0) {

      Alert.alert(
        language === "ar" ? "تحذير" : "Warning",
        language === "ar" ? "السلة فارغة" : "Cart is empty"
      );
      return;
    }
    
    // التنقل إلى شاشة تأكيد الطلب
    // CartScreen موجود في Tab Navigator، و OrderConfirm موجود في Stack Navigator
    // لذلك يجب استخدام getParent() للوصول إلى Stack Navigator
    try {

      
      // الطريقة الأولى: استخدام getParent() للوصول إلى Stack Navigator
      const stackNavigator = navigation.getParent();
      
      if (stackNavigator) {
        
        stackNavigator.navigate("OrderConfirm");
        
      } else {
        // الطريقة البديلة: استخدام navigate مباشرة
        
        navigation.navigate("OrderConfirm");
      }
    } catch (error) {
      console.error('❌ CartScreen: خطأ في التنقل:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" 
          ? `حدث خطأ أثناء التنقل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `An error occurred while navigating: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const incrementQuantity = (id: string) => {
    const item = cartItems.find((item: any) => item.id === id);
    if (item) {
      updateQuantity(id, (item.quantity || 1) + 1);
    }
  };

  const decrementQuantity = (id: string) => {
    const item = cartItems.find((item: any) => item.id === id);
    if (item && (item.quantity || 1) > 1) {
      updateQuantity(id, (item.quantity || 1) - 1);
    }
  };

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: (item.images && item.images.length > 0) ? item.images[0] : item.imageUrl }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {(item.price || 0).toLocaleString()} {item.currency === 'SAR' ? 'ر.س' : 'ر.ي'}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => decrementQuantity(item.id)}>
            <Ionicons name="remove" size={16} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity || 1}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => incrementQuantity(item.id)}>
            <Ionicons name="add" size={16} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B3B" />
        </TouchableOpacity>
        <Text style={styles.itemTotal}>
          {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "سلة المشتريات" : "Shopping Cart"}
        </Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="cart-outline" size={60} color="#FFD700" />
          </View>
          <Text style={styles.emptyText}>
            {language === "ar" ? "السلة فارغة" : "Cart is empty"}
          </Text>
          <Text style={styles.emptySubtext}>
            {language === "ar" ? "أضف منتجات لتبدأ التسوق" : "Add products to start shopping"}
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.browseBtnText}>
              {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Footer Summary */}
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {language === "ar" ? `المنتجات (${cartItems.length})` : `Items (${cartItems.length})`}
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {language === "ar" ? "الشحن" : "Shipping"}
              </Text>
              <Text style={styles.shippingFree}>
                {language === "ar" ? "مجاني" : "Free"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {language === "ar" ? "الإجمالي" : "Total"}
              </Text>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#1a1a1a" />
              <Text style={styles.checkoutBtnText}>
                {language === "ar" ? "تأكيد الطلب" : "Checkout"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? "#111" : "#f0f0f0",
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
  backButton: { padding: 6 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 1,
  },
  cartBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    minWidth: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: "#1a1a1a",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginBottom: 28,
    textAlign: "center",
  },
  browseBtn: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  browseBtnText: {
    color: "#1a1a1a",
    fontWeight: "800",
    fontSize: 15,
  },
  cartList: {
    padding: 14,
    paddingBottom: 6,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    alignItems: "center",
  },
  itemImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#2a2a2a",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "700",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "800",
    marginHorizontal: 12,
    color: isDarkMode ? "#fff" : "#1a1a1a",
  },
  itemRight: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: isDarkMode ? "#aaa" : "#666",
  },
  footer: {
    backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? "#2a2a2a" : "#eee",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#888",
  },
  summaryValue: {
    fontSize: 14,
    color: isDarkMode ? "#ccc" : "#333",
    fontWeight: "600",
  },
  shippingFree: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#eee",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD700",
  },
  checkoutBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 8,
  },
  checkoutBtnText: {
    color: "#1a1a1a",
    fontSize: 17,
    fontWeight: "900",
  },
});

export default CartScreen;