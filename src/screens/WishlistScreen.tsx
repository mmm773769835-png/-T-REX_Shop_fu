import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../shared/components/Button";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

const WishlistScreen = ({ navigation }: any) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "هاتف ذكي",
      price: 299.99,
      imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=📱",
      description: "هاتف حديث بكاميرا عالية الدقة"
    },
    {
      id: "2",
      name: "سماعة لاسلكية",
      price: 89.99,
      imageUrl: "https://via.placeholder.com/300x300/50C878/FFFFFF?text=🎧",
      description: "سماعة بلوتوث عالية الجودة"
    }
  ]);

  const handleRemoveFromWishlist = (id: string) => {
    Alert.alert(
      "إزالة من قائمة الرغبات",
      "هل أنت متأكد من إزالة هذا المنتج من قائمة الرغبات؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إزالة",
          style: "destructive",
          onPress: () => {
            setWishlistItems(wishlistItems.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  const handleAddToCart = (item: WishlistItem) => {
    Alert.alert("✅", `تم إضافة ${item.name} إلى السلة`);
  };

  const handleViewProduct = (item: WishlistItem) => {
    // @ts-ignore
    navigation.navigate('ProductDetails', { product: item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>❤️ قائمة الرغبات</Text>
        <View style={{ width: 24 }} />
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>قائمة الرغبات فارغة</Text>
          <Text style={styles.emptyText}>ابدأ بإضافة المنتجات التي تعجبك</Text>
          <View style={styles.browseButton}>
            <Button 
              title="تصفح المنتجات" 
              onPress={() => {
                // @ts-ignore
                navigation.navigate("MainTabs");
              }}
            />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {wishlistItems.map((item) => (
            <View key={item.id} style={styles.wishlistItem}>
              <TouchableOpacity onPress={() => handleViewProduct(item)}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <TouchableOpacity onPress={() => handleViewProduct(item)}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{item.price.toFixed(2)} ر.س</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  browseButton: {
    width: "80%",
  },
  wishlistItem: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
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
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
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