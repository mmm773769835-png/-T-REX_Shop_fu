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

  const styles = getStyles(isDarkMode, colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.title}>{language === "ar" ? "📦 طلباتي" : "📦 My Orders"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={64} color={isDarkMode ? "#666" : "#ccc"} />
            <Text style={styles.emptyText}>{language === "ar" ? "لا توجد طلبات" : "No orders yet"}</Text>
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
                      <Text style={styles.itemQuantity}>{language === "ar" ? "الكمية:" : "Quantity:"} {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{item.price} {language === "ar" ? "ر.ي" : "YER"}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>{language === "ar" ? "المجموع:" : "Total:"}</Text>
                <Text style={styles.totalAmount}>{order.total.toFixed(2)} {language === "ar" ? "ر.ي" : "YER"}</Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#007bff" />
                  <Text style={styles.actionButtonText}>{language === "ar" ? "عرض التفاصيل" : "View Details"}</Text>
                </TouchableOpacity>
                {order.status === "delivered" && (
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                      {language === "ar" ? "إعادة الطلب" : "Reorder"}
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

export default OrderHistoryScreen;
