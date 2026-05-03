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
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price || 0, (item.currency || 'YER') as any)}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => decrementQuantity(item.id)}
          >
            <Ionicons name="remove" size={16} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity || 1}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => incrementQuantity(item.id)}
          >
            <Ionicons name="add" size={16} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemove(item.id)}
      >
        <Ionicons name="close" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "🛒 سلة المشتريات" : "🛒 Shopping Cart"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={isDarkMode ? '#666' : '#ccc'} />
          <Text style={styles.emptyText}>
            {language === "ar" ? "سلة التسوق فارغة" : "Cart is empty"}
          </Text>
          <Text style={styles.emptySubtext}>
            {language === "ar" ? "ابدأ بإضافة منتجات إلى سلة التسوق" : "Start adding products to your cart"}
          </Text>
          
          <View style={styles.browseButton}>
            <Button 
              title={language === "ar" ? "تصفح المنتجات" : "Browse Products"} 
              onPress={() => navigation.navigate("HomeV2")} 
            />
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                {language === "ar" ? "الإجمالي:" : "Total:"}
              </Text>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
            
            <View style={styles.checkoutButton}>
              <Button 
                title={language === "ar" ? "تأكيد الطلب" : "Checkout"} 
                onPress={handleCheckout} 
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.header,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  browseButton: {
    width: "80%",
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  itemPrice: {
    fontSize: 18,
    color: "#e91e63",
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 12,
    color: colors.text,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.header,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e91e63",
  },
  checkoutButton: {
    // رفع الزر أعلى قليلاً
    marginTop: 10,
  },
});

export default CartScreen;