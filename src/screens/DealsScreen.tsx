import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useDeals } from '../contexts/DealsContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { sanitizeImageUrl } from '../utils/imageUtils';

const DealsScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { state, loadDeals } = useDeals();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const styles = getStyles(isDarkMode, colors);

  const handleAddToCart = (item: any) => {
    addToCart(item);
  };

  const handleViewProduct = (item: any) => {
    navigation.navigate('ProductDetails', { product: item });
  };

  const renderDealItem = (item: any) => {
    const discountPercent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.dealItem}
        onPress={() => handleViewProduct(item)}
      >
        <View style={styles.dealImageContainer}>
          <Image source={{ uri: sanitizeImageUrl((item.images && item.images.length > 0) ? item.images[0] : item.imageUrl) }} style={styles.dealImage} />
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
          </View>
        </View>
        
        <View style={styles.dealDetails}>
          <Text style={styles.dealName}>{item.name}</Text>
          <Text style={styles.dealDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice, (item.currency || 'YER') as any)}</Text>
            <Text style={styles.currentPrice}>{formatPrice(item.price, (item.currency || 'YER') as any)}</Text>
          </View>
          
          {item.validUntil && (
            <Text style={styles.validUntil}>
              {language === "ar" ? "ينتهي في: " : "Valid until: "}{item.validUntil.toLocaleDateString()}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {language === "ar" ? "إضافة للسلة" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "🔥 عروض يومية" : "🔥 Daily Deals"}
        </Text>
        <TouchableOpacity onPress={loadDeals} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      {state.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>
            {language === "ar" ? "جاري تحميل العروض..." : "Loading deals..."}
          </Text>
        </View>
      ) : state.deals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetag-outline" size={80} color={isDarkMode ? "#666" : "#ccc"} />
          <Text style={styles.emptyTitle}>
            {language === "ar" ? "لا توجد عروض حالياً" : "No deals available"}
          </Text>
          <Text style={styles.emptyText}>
            {language === "ar" ? "عد لاحقاً للاطلاع على العروض الجديدة" : "Check back later for new deals"}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? `🎉 ${state.deals.length} عرض متاح` : `🎉 ${state.deals.length} deals available`}
          </Text>
          {state.deals.map((item: any) => renderDealItem(item))}
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
  refreshButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
    textAlign: "center",
  },
  dealItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  dealImageContainer: {
    position: "relative",
  },
  dealImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dealDetails: {
    padding: 16,
  },
  dealName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 20,
    color: "#e91e63",
    fontWeight: "bold",
  },
  validUntil: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default DealsScreen;
