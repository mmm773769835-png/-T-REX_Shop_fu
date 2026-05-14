import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

const AboutScreen = ({ navigation }: any) => {
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
          {language === 'ar' ? 'عن المتجر' : 'About Store'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Logo Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>T-REX</Text>
        </View>
        <Text style={styles.storeName}>
          {language === 'ar' ? 'متجر T-REX' : 'T-REX Store'}
        </Text>
        <Text style={styles.tagline}>
          {language === 'ar' ? 'تسوّق بثقة، نوصّل بسرعة' : 'Shop with confidence, delivered fast'}
        </Text>
      </View>

      {/* About Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={20} color="#FFD700" />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'عن المتجر' : 'About Us'}
          </Text>
        </View>
        <Text style={styles.descText}>
          {language === 'ar'
            ? 'متجر T-REX هو متجر إلكتروني يمني متخصص في تقديم أفضل المنتجات بأسعار تنافسية مع توصيل سريع وخدمة عملاء احترافية على مدار الساعة.'
            : 'T-REX Store is a Yemeni e-commerce store specializing in offering the best products at competitive prices with fast delivery and 24/7 professional customer service.'}
        </Text>
      </View>

      {/* Contact Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call-outline" size={20} color="#FFD700" />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </Text>
        </View>

        {/* WhatsApp */}
        <TouchableOpacity style={styles.contactRow} onPress={openWhatsApp}>
          <View style={[styles.contactIcon, { backgroundColor: '#25D36622' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
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
            <Ionicons name="call-outline" size={20} color="#FFD700" />
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
            <Ionicons name="mail-outline" size={20} color="#4285F4" />
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
            <Ionicons name="location-outline" size={20} color="#FF6B35" />
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
            <Ionicons name="globe-outline" size={20} color="#9C27B0" />
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

      {/* Quick Action Buttons */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 T-REX Store.{' '}
          {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
        </Text>
        <Text style={styles.footerSub}>v1.0.0</Text>
      </View>

      <View style={{ height: 30 }} />
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
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1, borderBottomColor: "#2a2a2a",
  },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#2a2a2a",
    borderWidth: 3, borderColor: "#FFD700",
    justifyContent: "center", alignItems: "center",
    marginBottom: 12,
    elevation: 5, shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  logoText: { fontSize: 18, fontWeight: "900", color: "#FFD700", letterSpacing: 2 },
  storeName: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 6 },
  tagline: { fontSize: 13, color: "#888", textAlign: "center" },
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
  descText: {
    fontSize: 14, color: isDarkMode ? "#bbb" : "#555",
    lineHeight: 22, textAlign: "right",
  },
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
  footer: {
    alignItems: "center", marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1, borderTopColor: isDarkMode ? "#2a2a2a" : "#e0e0e0",
    marginHorizontal: 14,
  },
  footerText: { fontSize: 13, color: "#666", textAlign: "center" },
  footerSub: { fontSize: 11, color: "#444", marginTop: 4 },
});

export default AboutScreen;