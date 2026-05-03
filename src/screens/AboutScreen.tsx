import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from '../contexts/LanguageContext';

const AboutScreen = ({ navigation }: any) => {
  const { language } = useContext(LanguageContext);
  const appVersion = "1.0.0";
  const developerName = "محمد أبو الرجال";
  const contactEmail = "trexshopmex@gmail.com";
  const websiteUrl = "https://trexshopmax.com";

  const openWebsite = () => {
    Linking.openURL("https://trexshopmax.com");
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${contactEmail}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === 'ar' ? 'ℹ️ حول التطبيق' : 'ℹ️ About App'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={80} color="#007bff" />
        </View>

        <Text style={styles.appName}>{language === 'ar' ? 'متجر T-REX' : 'T-REX Store'}</Text>
        <Text style={styles.version}>{language === 'ar' ? 'الإصدار' : 'Version'} {appVersion}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'معلومات التطبيق' : 'App Information'}</Text>
          <Text style={styles.description}>
            {language === 'ar' ? 'متجر T-REX هو تطبيق تسوق إلكتروني متطور يوفر تجربة تسوق فريدة ومميزة للعملاء. يتيح التطبيق تصفح المنتجات، وإضافة المنتجات إلى السلة، وإتمام عمليات الشراء بسهولة وسرعة.' : 'T-REX Store is an advanced e-commerce application that provides a unique and distinctive shopping experience for customers. The app allows browsing products, adding products to the cart, and completing purchases easily and quickly.'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'معلومات المطور' : 'Developer Information'}</Text>
          <View style={styles.developerInfo}>
            <Ionicons name="people" size={20} color="#666" />
            <Text style={styles.infoText}>{developerName}</Text>
          </View>
          
          <TouchableOpacity style={styles.contactItem} onPress={sendEmail}>
            <Ionicons name="mail" size={20} color="#666" />
            <Text style={styles.infoText}>{contactEmail}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'روابط مهمة' : 'Important Links'}</Text>
          <TouchableOpacity style={styles.linkItem} onPress={openWebsite}>
            <Ionicons name="globe" size={20} color="#007bff" />
            <Text style={styles.linkText}>{language === 'ar' ? 'زيارة الموقع الإلكتروني' : 'Visit Website'}</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2025 {developerName}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</Text>
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
  logoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    textAlign: "right",
  },
  developerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    marginRight: 10,
    flex: 1,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: "#007bff",
    flex: 1,
    marginRight: 10,
  },
  copyright: {
    alignItems: "center",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  copyrightText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default AboutScreen;