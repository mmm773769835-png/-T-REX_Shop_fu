import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HelpScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>❓ المساعدة</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>الأسئلة الشائعة</Text>

        <View style={styles.faqItem}>
          <Text style={styles.question}>كيف أقوم بإضافة منتج؟</Text>
          <Text style={styles.answer}>
            اذهب إلى الصفحة الرئيسية واضغط على زر "إضافة منتج" في الأعلى. املأ جميع التفاصيل المطلوبة واضغط على "حفظ".
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>كيف أتواصل مع الدعم الفني؟</Text>
          <Text style={styles.answer}>
            يمكنك التواصل معنا عبر البريد الإلكتروني: support@trexshop.com أو الاتصال على: 1234567890
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>كيف أقوم بتتبع طلبي؟</Text>
          <Text style={styles.answer}>
            اذهب إلى "طلباتي" من القائمة الجانبية لرؤية جميع طلباتك وحالتها الحالية.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>ما هي طرق الدفع المتاحة؟</Text>
          <Text style={styles.answer}>
            نقبل الدفع النقدي عند الاستلام، التحويل البنكي، والبطاقات الائتمانية.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          
          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="mail" size={24} color="#007bff" />
            <Text style={styles.contactText}>support@trexshop.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="call" size={24} color="#007bff" />
            <Text style={styles.contactText}>1234567890</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.contactText}>واتساب: 1234567890</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
});

export default HelpScreen;
