import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
          image: "https://via.placeholder.com/80",
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
          image: "https://via.placeholder.com/80",
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
        return "تم التسليم";
      case "shipped":
        return "قيد الشحن";
      case "processing":
        return "قيد المعالجة";
      case "pending":
        return "معلق";
      case "cancelled":
        return "ملغي";
      default:
        return "غير معروف";
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>📦 طلباتي</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد طلبات</Text>
            <Text style={styles.emptySubtext}>ابدأ التسوق الآن!</Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                  <Ionicons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
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
                      <Text style={styles.itemQuantity}>الكمية: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{item.price} ر.س</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>المجموع:</Text>
                <Text style={styles.totalAmount}>{order.total.toFixed(2)} ر.س</Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#007bff" />
                  <Text style={styles.actionButtonText}>عرض التفاصيل</Text>
                </TouchableOpacity>
                {order.status === "delivered" && (
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                      إعادة الطلب
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  itemDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#999",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  primaryButtonText: {
    color: "#fff",
  },
});

export default OrderHistoryScreen;
