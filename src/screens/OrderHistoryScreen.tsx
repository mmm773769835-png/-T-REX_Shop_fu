import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Linking, Share, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDefaultProductImage } from "../utils/imageUtils";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { dbService } from '../services/SupabaseService';

interface OrderItem {
  name?: string;
  title?: string;
  quantity?: number;
  price?: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  total?: number;
  name?: string;
  phone?: string;
  country?: string;
  address?: string;
  paymentMethod?: string;
  influencer_code?: string | null;
  items?: OrderItem[];
  product_details?: any[];
}

const OrderHistoryScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await dbService.get('orders');
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        // Default fallback
        setOrders([
          {
            id: "101",
            orderNumber: "ORD-2024-001",
            date: "2024-11-25",
            status: "delivered",
            total: 299.99,
            influencer_code: "INF-99835",
            name: "عميل تجريبي",
            phone: "+967 773769835",
            country: "اليمن",
            address: "صنعاء - شارع حدة",
            paymentMethod: "cash",
            items: [
              { name: "منتج تجريبي", quantity: 2, price: 99.99, image: getDefaultProductImage() },
            ],
          },
        ]);
      }
    } catch (e) {
      console.warn("Could not fetch orders from DB:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "delivered": return "#4caf50";
      case "shipped": return "#2196f3";
      case "processing": return "#ff9800";
      case "pending": return "#9e9e9e";
      case "cancelled": return "#f44336";
      default: return "#4caf50";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "delivered": return language === "ar" ? "تم التسليم" : "Delivered";
      case "shipped": return language === "ar" ? "قيد الشحن" : "Shipped";
      case "processing": return language === "ar" ? "قيد المعالجة" : "Processing";
      case "pending": return language === "ar" ? "معلق" : "Pending";
      case "cancelled": return language === "ar" ? "ملغي" : "Cancelled";
      default: return language === "ar" ? "مكتمل" : "Completed";
    }
  };

  const sendVoucherToWhatsApp = (order: Order) => {
    const whatsappNumber = "967773769835";
    let message = language === "ar"
      ? `📋 *سند طلب إلكتروني - T-REX Shop*\n` +
        `--------------------------------\n` +
        `🆔 *رقم الطلب:* #${order.id}\n` +
        `👤 *العميل:* ${order.name || 'عميل'}\n` +
        `📞 *الهاتف:* ${order.phone || 'غير محدد'}\n` +
        `🌍 *الدولة:* ${order.country || 'اليمن'}\n` +
        `📍 *العنوان:* ${order.address || 'غير محدد'}\n`
      : `📋 *Electronic Receipt - T-REX Shop*\n` +
        `--------------------------------\n` +
        `🆔 *Order ID:* #${order.id}\n` +
        `👤 *Customer:* ${order.name || 'Customer'}\n` +
        `📞 *Phone:* ${order.phone || 'N/A'}\n` +
        `🌍 *Country:* ${order.country || 'Yemen'}\n`;

    if (order.influencer_code) {
      message += language === "ar"
        ? `\n🏷️ *كود المؤثر المحوّل:* [ ${order.influencer_code} ]\n📌 *تنبيه:* تم هذا الطلب عبر إحالة كود المؤثر (${order.influencer_code}).\n`
        : `\n🏷️ *Influencer Code:* [ ${order.influencer_code} ]\n`;
    }

    message += language === "ar"
      ? `\n💰 *الإجمالي:* ${order.total || 0} ر.ي\n` +
        `📅 *التاريخ:* ${order.date || order.createdAt || new Date().toLocaleDateString()}\n`
      : `\n💰 *Total:* ${order.total || 0} YER\n`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Share.share({ message });
    });
  };

  const styles = getStyles(isDarkMode, colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === "ar" ? "طلباتي والسندات" : "My Orders & Receipts"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: colors.text, marginTop: 10 }}>{language === "ar" ? "جاري تحميل الطلبات..." : "Loading orders..."}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="receipt-outline" size={54} color="#FFD700" />
              </View>
              <Text style={styles.emptyText}>{language === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}</Text>
              <Text style={styles.emptySubtext}>{language === "ar" ? "ابدأ التسوق الآن!" : "Start shopping now!"}</Text>
            </View>
          ) : (
            orders.map(order => {
              const itemList = order.items || order.product_details || [];
              const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'سند مؤكد');

              return (
                <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => setSelectedOrder(order)} activeOpacity={0.85}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNumber}>#{order.orderNumber || order.id}</Text>
                      <Text style={styles.orderDate}>{orderDate}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "22" }]}>
                      <Ionicons name="checkmark-circle" size={14} color={getStatusColor(order.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>

                  {order.influencer_code ? (
                    <View style={styles.influencerBadgeRow}>
                      <Ionicons name="pricetag" size={14} color="#000" />
                      <Text style={styles.influencerBadgeText}>
                        {language === "ar" ? `كود المؤثر: ${order.influencer_code}` : `Influencer: ${order.influencer_code}`}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.orderItems}>
                    {itemList.slice(0, 3).map((item: any, index: number) => (
                      <View key={index} style={styles.orderItem}>
                        <Image source={{ uri: item.image || getDefaultProductImage() }} style={styles.itemImage} />
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName} numberOfLines={1}>{item.name || item.title || 'منتج'}</Text>
                          <Text style={styles.itemQuantity}>x{item.quantity || 1}</Text>
                        </View>
                        <Text style={styles.itemPrice}>{item.price || 0} {language === "ar" ? "ر.ي" : "YER"}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.orderFooter}>
                    <TouchableOpacity style={styles.viewVoucherBtn} onPress={() => setSelectedOrder(order)}>
                      <Ionicons name="document-text-outline" size={16} color="#FFD700" />
                      <Text style={styles.viewVoucherText}>{language === "ar" ? "معاينة السند / الفاتورة" : "View Receipt"}</Text>
                    </TouchableOpacity>
                    <Text style={styles.totalAmount}>{(order.total || 0).toLocaleString()} {language === "ar" ? "ر.ي" : "YER"}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Voucher / Receipt Modal */}
      <Modal visible={!!selectedOrder} transparent animationType="slide" onRequestClose={() => setSelectedOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 20 }}>🦖</Text>
                <Text style={styles.modalHeaderTitle}>{language === "ar" ? "سند طلب إلكتروني" : "Order Receipt Voucher"}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close-circle" size={26} color="#888" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={{ padding: 16 }}>
                {/* Store Header Banner */}
                <View style={styles.voucherLogoBanner}>
                  <Text style={styles.voucherStoreTitle}>T-REX Shop</Text>
                  <Text style={styles.voucherSubtitle}>{language === "ar" ? "سند شراء رسمي مؤكد" : "Official Purchase Receipt"}</Text>
                </View>

                {/* Influencer Code Section in Receipt */}
                {selectedOrder.influencer_code ? (
                  <View style={styles.influencerVoucherBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="pricetag" size={18} color="#000" />
                      <Text style={styles.influencerVoucherTitle}>
                        {language === "ar" ? "كود التسويق (المؤثر) المحوّل:" : "Transferred Influencer Code:"}
                      </Text>
                    </View>
                    <Text style={styles.influencerVoucherCode}>{selectedOrder.influencer_code}</Text>
                    <Text style={styles.influencerVoucherNotice}>
                      {language === "ar" ? "📌 تم ربط وتفعيل هذا السند عبر رابط إحالة المؤثر." : "📌 Linked to influencer referral code."}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.influencerVoucherBox, { backgroundColor: '#f0f0f0', borderColor: '#ccc' }]}>
                    <Text style={{ color: '#666', fontSize: 13, textAlign: 'center' }}>
                      {language === "ar" ? "طلب مباشر (بدون كود مؤثر)" : "Direct order (No influencer code)"}
                    </Text>
                  </View>
                )}

                {/* Details Section */}
                <View style={styles.voucherDetailRow}>
                  <Text style={styles.voucherDetailLabel}>{language === "ar" ? "رقم الطلب:" : "Order ID:"}</Text>
                  <Text style={styles.voucherDetailValue}>#{selectedOrder.id}</Text>
                </View>
                <View style={styles.voucherDetailRow}>
                  <Text style={styles.voucherDetailLabel}>{language === "ar" ? "الاسم:" : "Customer:"}</Text>
                  <Text style={styles.voucherDetailValue}>{selectedOrder.name || "عميل"}</Text>
                </View>
                <View style={styles.voucherDetailRow}>
                  <Text style={styles.voucherDetailLabel}>{language === "ar" ? "الهاتف:" : "Phone:"}</Text>
                  <Text style={styles.voucherDetailValue}>{selectedOrder.phone || "غير محدد"}</Text>
                </View>
                <View style={styles.voucherDetailRow}>
                  <Text style={styles.voucherDetailLabel}>{language === "ar" ? "الدولة والمدينة:" : "Country & City:"}</Text>
                  <Text style={styles.voucherDetailValue}>{selectedOrder.country || "اليمن"} - {selectedOrder.address || ""}</Text>
                </View>

                {/* Total Box */}
                <View style={styles.voucherTotalBox}>
                  <Text style={{ color: '#fff', fontSize: 14 }}>{language === "ar" ? "إجمالي الفاتورة" : "Total Amount"}</Text>
                  <Text style={{ color: '#FFD700', fontSize: 22, fontWeight: 'bold' }}>{(selectedOrder.total || 0).toLocaleString()} {language === "ar" ? "ر.ي" : "YER"}</Text>
                </View>

                {/* WhatsApp Send Button */}
                <TouchableOpacity style={styles.whatsappSendBtn} onPress={() => sendVoucherToWhatsApp(selectedOrder)}>
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.whatsappSendBtnText}>
                    {language === "ar" ? "إعادة إرسال السند عبر الواتساب" : "Send Receipt via WhatsApp"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? "#111" : "#f0f0f0" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    backgroundColor: "#1a1a1a", borderBottomWidth: 1, borderBottomColor: "#2a2a2a",
  },
  backBtn: { padding: 6 },
  title: { fontSize: 17, fontWeight: "800", color: "#FFD700", letterSpacing: 1 },
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
  influencerBadgeRow: {
    backgroundColor: "#00e676",
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  influencerBadgeText: { color: "#000", fontWeight: "bold", fontSize: 13 },
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
  viewVoucherBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewVoucherText: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
  totalAmount: { fontSize: 17, fontWeight: "900", color: "#FFD700" },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 16 },
  modalContainer: { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', borderRadius: 20, maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#111' },
  modalHeaderTitle: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  voucherLogoBanner: { alignItems: 'center', padding: 16, backgroundColor: '#111', borderRadius: 12, marginBottom: 14 },
  voucherStoreTitle: { color: '#FFD700', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  voucherSubtitle: { color: '#aaa', fontSize: 12, marginTop: 2 },
  influencerVoucherBox: { backgroundColor: '#00e676', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#00c853' },
  influencerVoucherTitle: { color: '#000', fontSize: 13, fontWeight: '600' },
  influencerVoucherCode: { color: '#000', fontSize: 20, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  influencerVoucherNotice: { color: '#000', fontSize: 11, marginTop: 4, opacity: 0.9 },
  voucherDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#333' : '#eee' },
  voucherDetailLabel: { color: isDarkMode ? '#aaa' : '#666', fontSize: 13 },
  voucherDetailValue: { color: isDarkMode ? '#fff' : '#111', fontSize: 13, fontWeight: 'bold' },
  voucherTotalBox: { backgroundColor: '#111', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 14, marginBottom: 14 },
  whatsappSendBtn: { backgroundColor: '#25D366', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, marginBottom: 20 },
  whatsappSendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default OrderHistoryScreen;
