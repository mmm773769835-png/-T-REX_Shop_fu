import React, { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LanguageContext } from "../contexts/LanguageContext";
import { ThemeContext } from "../contexts/ThemeContext";

const SecurityPolicyScreen = ({ navigation }: any) => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode, colors);

  const sections = language === "ar"
    ? [
        {
          icon: "shield-checkmark-outline" as const,
          title: "حماية الحساب",
          text: "نستخدم Supabase لإدارة تسجيل الدخول والجلسات بشكل آمن. لا يتم حفظ كلمة المرور داخل التطبيق، ويتم التعامل معها من خلال نظام المصادقة الآمن.",
        },
        {
          icon: "lock-closed-outline" as const,
          title: "حفظ الجلسة",
          text: "بعد تسجيل الدخول بنجاح، يتم حفظ الجلسة على جهازك حتى لا يطلب التطبيق تسجيل الدخول في كل مرة، ويمكنك تسجيل الخروج يدويًا عند الحاجة.",
        },
        {
          icon: "cloud-outline" as const,
          title: "مصدر البيانات",
          text: "يعتمد التطبيق على Supabase لجلب المنتجات والمفضلة والحسابات. لا نستخدم Firebase في مسار تسجيل الدخول أو جلب المنتجات الأساسي.",
        },
        {
          icon: "image-outline" as const,
          title: "الصور والملفات",
          text: "عند اختيار صورة للملف الشخصي أو إيصال الدفع، يتم رفعها إلى التخزين السحابي المرتبط بالتطبيق لاستخدامها داخل الطلب أو الملف الشخصي.",
        },
        {
          icon: "cart-outline" as const,
          title: "الطلبات والشحن",
          text: "بيانات الطلب تُستخدم لإتمام عملية الشراء والتواصل مع العميل. رسوم الشحن تظهر حسب المسافة وليست مبلغًا ثابتًا داخل التطبيق.",
        },
      ]
    : [
        {
          icon: "shield-checkmark-outline" as const,
          title: "Account Protection",
          text: "The app uses Supabase for secure authentication and sessions. Passwords are not stored inside the app and are handled by the secure authentication provider.",
        },
        {
          icon: "lock-closed-outline" as const,
          title: "Session Persistence",
          text: "After successful login, the session is kept on your device so the app does not ask you to sign in every time. You can sign out manually when needed.",
        },
        {
          icon: "cloud-outline" as const,
          title: "Data Source",
          text: "The app uses Supabase for products, wishlists, and user accounts. Firebase is not used for the main authentication or product data flow.",
        },
        {
          icon: "image-outline" as const,
          title: "Images and Files",
          text: "When you select a profile image or payment receipt, it is uploaded to the app storage to be used with your profile or order.",
        },
        {
          icon: "cart-outline" as const,
          title: "Orders and Shipping",
          text: "Order data is used to complete purchases and customer communication. Shipping is shown as distance-based and is not a fixed amount inside the app.",
        },
      ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === "ar" ? "الحماية والخصوصية" : "Security & Privacy"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark" size={42} color="#111" />
        </View>
        <Text style={styles.heroTitle}>{language === "ar" ? "تسوّق بأمان مع T-REX" : "Shop safely with T-REX"}</Text>
        <Text style={styles.heroText}>
          {language === "ar"
            ? "هذه الصفحة توضّح كيف يحمي التطبيق الحساب والبيانات الأساسية أثناء الاستخدام."
            : "This page explains how the app protects your account and essential data while using the service."}
        </Text>
      </View>

      {sections.map(section => (
        <View key={section.title} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name={section.icon} size={22} color="#FFD700" />
            </View>
            <Text style={styles.cardTitle}>{section.title}</Text>
          </View>
          <Text style={styles.cardText}>{section.text}</Text>
        </View>
      ))}

      <View style={styles.noticeCard}>
        <Ionicons name="information-circle-outline" size={22} color="#FFD700" />
        <Text style={styles.noticeText}>
          {language === "ar"
            ? "لأفضل حماية، لا تشارك كلمة المرور أو رموز التحقق مع أي شخص."
            : "For best protection, never share your password or verification codes with anyone."}
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.header,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkMode ? "#252525" : "#111",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  heroCard: {
    margin: 16,
    padding: 20,
    borderRadius: 22,
    backgroundColor: isDarkMode ? "#1f1f1f" : "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  heroIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: isDarkMode ? "#1f1f1f" : "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD70022",
    marginRight: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    flex: 1,
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 23,
  },
  noticeCard: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD70018",
    borderWidth: 1,
    borderColor: "#FFD70044",
    gap: 10,
  },
  noticeText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
    fontWeight: "700",
  },
});

export default SecurityPolicyScreen;
