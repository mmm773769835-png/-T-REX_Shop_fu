import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDefaultProductImage } from "../utils/imageUtils";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

const OrderHistoryScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [orders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      date: "2024-11-25",
      status: "delivered",
      total: 299.99,
      items: [
        {
          name: "منتج تجريبي",
          quantity: 2,
          price: 99.99,
          image: getDefaultProductImage(),
        },
      ],
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      date: "2024-11-28",
      status: "processing",
      total: 150.00,
      items: [
        {
          name: "منتج آخر",
          quantity: 1,
          price: 150.00,
          image: getDefaultProductImage(),
        },
      ],
    },
  ]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "#4caf50";
      case "shipped":
        return "#2196f3";
      case "processing":
        return "#ff9800";
      case "pending":
        return "#9e9e9e";
      case "cancelled":
        return "#f44336";
      default:
        return "#999";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return language === "ar" ? "تم التسليم" : "Delivered";
      case "shipped":
        return language === "ar" ? "قيد الشحن" : "Shipped";
      case "processing":
        return language === "ar" ? "قيد المعالجة" : "Processing";
      case "pending":
        return language === "ar" ? "معلق" : "Pending";
      case "cancelled":
        return language === "ar" ? "ملغي" : "Cancelled";
      default:
        return language === "ar" ? "غير معروف" : "Unknown";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "checkmark-circle";
      case "shipped":
        return "airplane";
      case "processing":
        return "time";
      case "pending":
        return "hourglass";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === "ar" ? "طلباتي" : "My Orders"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="bag-outline" size={54} color="#FFD700" />
            </View>
            <Text style={styles.emptyText}>{language === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}</Text>
            <Text style={styles.emptySubtext}>{language === "ar" ? "ابدأ التسوق الآن!" : "Start shopping now!"}</Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "22" }]}>
                  <Ionicons name={getStatusIcon(order.status) as any} size={14} color={getStatusColor(order.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{item.price} {language === "ar" ? "ر.ي" : "YER"}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>{language === "ar" ? "المجموع" : "Total"}</Text>
                <Text style={styles.totalAmount}>{order.total.toLocaleString()} {language === "ar" ? "ر.ي" : "YER"}</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? "#111" : "#f0f0f0" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    backgroundColor: "#1a1a1a", borderBottomWidth: 1, borderBottomColor: "#2a2a2a",
  },
  backBtn: { padding: 6 },
  title: { fontSize: 18, fontWeight: "800", color: "#FFD700", letterSpacing: 1 },
  content: { flex: 1 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 60 },
  emptyIconWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16, borderWidth: 2, borderColor: "#FFD700",
  },
  emptyText: { fontSize: 20, fontWeight: "800", color: isDarkMode ? "#fff" : "#1a1a1a", marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: "#888", textAlign: "center" },
  orderCard: {
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    marginHorizontal: 14, marginTop: 14,
    borderRadius: 18, overflow: "hidden",
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5,
  },
  orderHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
  },
  orderNumber: { fontSize: 15, fontWeight: "700", color: isDarkMode ? "#fff" : "#1a1a1a" },
  orderDate: { fontSize: 12, color: "#888", marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  orderItems: { padding: 14 },
  orderItem: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 10, gap: 10,
  },
  itemImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#2a2a2a" },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", color: isDarkMode ? "#fff" : "#1a1a1a" },
  itemQuantity: { fontSize: 12, color: "#888", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#FFD700" },
  orderFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f9f9f9",
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: isDarkMode ? "#ccc" : "#555" },
  totalAmount: { fontSize: 18, fontWeight: "900", color: "#FFD700" },
});

export default OrderHistoryScreen;
