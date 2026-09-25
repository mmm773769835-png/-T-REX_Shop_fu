import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

const HelpScreen = ({ navigation }: any) => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);

  const WHATSAPP = "+967773769835";
  const EMAIL = "trexshopmax@gmail.com";
  const WEBSITE = "https://trexshopmax.com";
  const ADDRESS_AR = "صنعاء – سعوان، شارع الأربعين";
  const ADDRESS_EN = "Sana'a – Sawan, Al-Arbaeen Street";

  const openWhatsApp = () => Linking.openURL(`https://wa.me/${WHATSAPP.replace('+', '')}`);
  const sendEmail   = () => Linking.openURL(`mailto:${EMAIL}`);
  const openWebsite = () => Linking.openURL(WEBSITE);
  const callPhone   = () => Linking.openURL(`tel:${WHATSAPP}`);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ar' ? 'المساعدة والدعم الفني' : 'Help & Technical Support'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Support & Contact Info Card (Matching Store Info) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="headset-outline" size={22} color="#FFD700" />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'تواصل معنا للدعم الفني' : 'Contact Support'}
          </Text>
        </View>

        {/* WhatsApp */}
        <TouchableOpacity style={styles.contactRow} onPress={openWhatsApp}>
          <View style={[styles.contactIcon, { backgroundColor: '#25D36622' }]}>
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {language === 'ar' ? 'واتساب / دعم فني' : 'WhatsApp / Support'}
            </Text>
            <Text style={styles.contactValue}>{WHATSAPP}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#555" />
        </TouchableOpacity>

        {/* Phone */}
        <TouchableOpacity style={styles.contactRow} onPress={callPhone}>
          <View style={[styles.contactIcon, { backgroundColor: '#FFD70022' }]}>
            <Ionicons name="call-outline" size={22} color="#FFD700" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </Text>
            <Text style={styles.contactValue}>{WHATSAPP}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#555" />
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity style={styles.contactRow} onPress={sendEmail}>
          <View style={[styles.contactIcon, { backgroundColor: '#4285F422' }]}>
            <Ionicons name="mail-outline" size={22} color="#4285F4" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </Text>
            <Text style={styles.contactValue}>{EMAIL}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#555" />
        </TouchableOpacity>

        {/* Address */}
        <View style={styles.contactRow}>
          <View style={[styles.contactIcon, { backgroundColor: '#FF6B3522' }]}>
            <Ionicons name="location-outline" size={22} color="#FF6B35" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {language === 'ar' ? 'العنوان' : 'Address'}
            </Text>
            <Text style={styles.contactValue}>
              {language === 'ar' ? ADDRESS_AR : ADDRESS_EN}
            </Text>
          </View>
        </View>

        {/* Website */}
        <TouchableOpacity style={[styles.contactRow, { borderBottomWidth: 0 }]} onPress={openWebsite}>
          <View style={[styles.contactIcon, { backgroundColor: '#9C27B022' }]}>
            <Ionicons name="globe-outline" size={22} color="#9C27B0" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
            </Text>
            <Text style={[styles.contactValue, { color: '#9C27B0' }]}>{WEBSITE}</Text>
          </View>
          <Ionicons name="open-outline" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsappBtnText}>
            {language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.websiteBtn} onPress={openWebsite}>
          <Ionicons name="globe-outline" size={20} color="#FFD700" />
          <Text style={styles.websiteBtnText}>
            {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FAQ Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="help-circle-outline" size={22} color="#FFD700" />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>
            {language === 'ar' ? 'كيف أقوم بإضافة منتج وتفعيله؟' : 'How do I add and feature a product?'}
          </Text>
          <Text style={styles.answer}>
            {language === 'ar'
              ? 'اذهب إلى لوحة التحكم أو اضغط على إضافة منتج جديد. املأ بيانات المنتج، ويمكنك استخدام كود التفعيل لتمييز المنتج واشتراكه.'
              : 'Go to dashboard or tap Add Product. Fill product info and use activation code for featuring.'}
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>
            {language === 'ar' ? 'كيف أتواصل مع الدعم المباشر؟' : 'How do I contact direct support?'}
          </Text>
          <Text style={styles.answer}>
            {language === 'ar'
              ? 'يمكنك التواصل معنا فوراً عبر زر "تواصل عبر واتساب" أو الاتصال بالرقم +967773769835.'
              : 'You can contact us via WhatsApp button or call +967773769835.'}
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>
            {language === 'ar' ? 'ما هي الحسابات البنكية المتاحة للدفع؟' : 'Which bank accounts are available?'}
          </Text>
          <Text style={styles.answer}>
            {language === 'ar'
              ? 'نوفر حساب بنك الكريمي (2336444)، ومحافظ جيب، ون كاش، وجولي على الرقم 773769835.'
              : 'We provide Kuraimi account (2336444), and Jeeb, OneCash, July wallets on 773769835.'}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? "#111" : "#f0f0f0" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1, borderBottomColor: "#2a2a2a",
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFD700", letterSpacing: 1 },
  card: {
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    marginHorizontal: 14, marginTop: 14,
    borderRadius: 18, padding: 16,
    elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: isDarkMode ? "#fff" : "#1a1a1a" },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
  },
  contactIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: "700", color: isDarkMode ? "#fff" : "#1a1a1a" },
  actionButtons: {
    flexDirection: "row", gap: 10,
    marginHorizontal: 14, marginTop: 14,
  },
  whatsappBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#25D366", borderRadius: 14,
    paddingVertical: 14, gap: 8,
  },
  whatsappBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  websiteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#FFD700", borderRadius: 14,
    paddingVertical: 14, gap: 8,
  },
  websiteBtnText: { color: "#FFD700", fontWeight: "800", fontSize: 14 },
  faqItem: {
    backgroundColor: isDarkMode ? "#262626" : "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  question: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 4,
  },
  answer: {
    fontSize: 13,
    color: isDarkMode ? "#ccc" : "#555",
    lineHeight: 20,
  },
});

export default HelpScreen;
