import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../shared/components/Button";

const CartScreen = ({ route, navigation }: any) => {
  // Safely extract cartItems from route.params
  const initialCart = route?.params?.cartItems || [];
  const [cartItems, setCartItems] = useState(initialCart);

  const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

  const handleRemove = (id: string) => {
    const updated = cartItems.filter((item: any) => item.id !== id);
    setCartItems(updated);
  };

  const handleCheckout = () => {
    // @ts-ignore
    navigation.getParent().navigate("OrderConfirm", { cartItems });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updated = cartItems.map((item: any) => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
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
        source={{ uri: item.imageUrl }} 
        style={styles.itemImage} 
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price?.toFixed(2) || "0.00"} ر.ي</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => decrementQuantity(item.id)}
          >
            <Ionicons name="remove" size={16} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity || 1}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => incrementQuantity(item.id)}
          >
            <Ionicons name="add" size={16} color="#000" />
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>🛒 سلة المشتريات</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>سلة التسوق فارغة</Text>
          <Text style={styles.emptySubtext}>ابدأ بإضافة منتجات إلى سلة التسوق</Text>
          
          <View style={styles.browseButton}>
            <Button 
              title="تصفح المنتجات" 
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
              <Text style={styles.totalLabel}>الإجمالي:</Text>
              <Text style={styles.totalAmount}>{total.toFixed(2)} ر.ي</Text>
            </View>
            
            <View style={styles.checkoutButton}>
              <Button 
                title="تأكيد الطلب" 
                onPress={handleCheckout} 
              />
            </View>
          </View>
        </>
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
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
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
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
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