import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../shared/components/Button";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useWishList } from '../contexts/WishListContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { sanitizeImageUrl } from '../utils/imageUtils';

const WishlistScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  const { state, removeFromWishList } = useWishList();
  const { addToCart } = useCart();

  const styles = getStyles(isDarkMode, colors);

  const handleRemoveFromWishlist = (id: string) => {
    Alert.alert(
      language === "ar" ? "إزالة من قائمة الأمنيات" : "Remove from Wishlist",
      language === "ar" ? "هل أنت متأكد من إزالة هذا المنتج من قائمة الأمنيات؟" : "Are you sure you want to remove this product from wishlist?",
      [
        { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "إزالة" : "Remove",
          style: "destructive",
          onPress: () => {
            removeFromWishList(id);
          }
        }
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    Alert.alert(
      language === "ar" ? "✅ تم الإضافة" : "✅ Added",
      language === "ar" ? `تم إضافة ${item.name} إلى السلة` : `Added ${item.name} to cart`
    );
  };

  const handleViewProduct = (item: any) => {
    navigation.navigate('ProductDetails', { product: item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "❤️ قائمة الأمنيات" : "❤️ Wishlist"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {state.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={isDarkMode ? "#666" : "#ccc"} />
          <Text style={styles.emptyTitle}>
            {language === "ar" ? "قائمة الأمنيات فارغة" : "Wishlist is empty"}
          </Text>
          <Text style={styles.emptyText}>
            {language === "ar" ? "ابدأ بإضافة المنتجات التي تعجبك" : "Start adding products you like"}
          </Text>
          <View style={styles.browseButton}>
            <Button 
              title={language === "ar" ? "تصفح المنتجات" : "Browse Products"} 
              onPress={() => {
                navigation.navigate("MainTabs");
              }}
            />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {state.items.map((item: any) => (
            <View key={item.id} style={styles.wishlistItem}>
              <TouchableOpacity onPress={() => handleViewProduct(item)}>
                <Image source={{ uri: sanitizeImageUrl((item.images && item.images.length > 0) ? item.images[0] : item.imageUrl) }} style={styles.itemImage} />
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <TouchableOpacity onPress={() => handleViewProduct(item)}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price, (item.currency || 'YER') as any)}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Ionicons name="cart" size={20} color="#007bff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Ionicons name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  browseButton: {
    width: "80%",
  },
  wishlistItem: {
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
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 18,
    color: "#e91e63",
    fontWeight: "bold",
  },
  itemActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default WishlistScreen;
