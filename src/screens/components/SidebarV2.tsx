import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isVisible?: boolean;
  onClose?: () => void;
  onAddProduct?: () => void;
  onLoginLogout?: () => void;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
  navigation?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SidebarV2: React.FC<SidebarProps> = ({
  isVisible = false,
  onClose,
  onAddProduct,
  onLoginLogout,
  isAdmin = false,
  isLoggedIn = false,
  navigation,
}) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { language, switchLanguage } = useContext(LanguageContext);
  const { user } = useAuth();
  const [showBankInfo, setShowBankInfo] = useState(false);

  const BANK_INFO = {
    bankName: "بنك الكريمي المميز",
    accountNumber: "حساب مشتريات وتجار الكريمي",
    accountNumberValue: "2336444",
    jeebWallet: "محفظة جيب (تحويل مباشر):",
    jeebNumber: "773769835",
    jeebName: "بسام محمد أبوالرجال",
    julyWallet: "محفظة جولي (تحويل مباشر):",
    julyNumber: "773769835",
    julyName: "بسام محمد أبوالرجال",
    oneCashWallet: "محفظة ون كاش (تحويل مباشر):",
    oneCashNumber: "773769835",
    oneCashName: "بسام محمد أبوالرجال",
  };

  const copyToClipboard = (text: string, title: string) => {
    Alert.alert(
      language === "ar" ? "📋 تم النسخ" : "📋 Copied",
      language === "ar" ? `تم نسخ رقم ${title}: ${text}` : `${title} number copied: ${text}`
    );
  };

  const navigateToScreen = (screenName: string) => {
    if (onClose) onClose();
    if (navigation) {
      try {
        const parent = typeof navigation.getParent === 'function' ? navigation.getParent() : null;
        if (parent && typeof parent.navigate === 'function') {
          parent.navigate(screenName);
        } else {
          navigation.navigate(screenName);
        }
      } catch (err) {
        try {
          navigation.navigate(screenName);
        } catch (e) {
          console.log('Navigation error:', e);
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop overlay to close drawer */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Slide Drawer Content */}
        <SafeAreaView style={[styles.drawer, isDarkMode ? styles.darkDrawer : styles.lightDrawer]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../logo.png')}
                style={styles.logoImage}
              />
              <View style={styles.brandInfo}>
                <Text style={styles.brandTitle}>T-REX SHOP</Text>
                <Text style={styles.brandSubtitle}>
                  {isAdmin
                    ? (language === 'ar' ? '👑 مسؤول المنصة' : '👑 Platform Admin')
                    : isLoggedIn
                    ? (language === 'ar' ? '🏬 حساب تاجر معتمد' : '🏬 Verified Vendor')
                    : (language === 'ar' ? '👤 زائر المتجر' : '👤 Store Visitor')}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={30} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
            {/* Section: Accounts & Banking */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFD700' : '#d4af37' }]}>
              💳 {language === "ar" ? "الحسابات والمدفوعات" : "Accounts & Payments"}
            </Text>

            {/* Bank Account Info */}
            <TouchableOpacity
              style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
              onPress={() => setShowBankInfo(true)}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Ionicons name="card" size={20} color="#FFD700" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "معلومات الحساب البنكي والتحويلات" : "Bank & Wallet Transfer Info"}
                </Text>
                <Text style={styles.menuSubtext}>
                  {language === "ar" ? "الكريمي، جيب، ون كاش، جولي" : "Kuraimi, Jeeb, OneCash, July"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>

            {/* Payment Notification */}
            <TouchableOpacity
              style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
              onPress={() => {
                Alert.alert(
                  language === "ar" ? "إرسال إشعار دفع" : "Send Payment Receipt",
                  language === "ar"
                    ? "يرجى التواصل مع الدعم أو رفع صورة إيصال التحويل عبر واتساب المبيعات."
                    : "Please contact support or attach receipt via WhatsApp.",
                  [
                    { text: language === "ar" ? "حسناً" : "OK" }
                  ]
                );
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(40, 167, 69, 0.15)' }]}>
                <Ionicons name="receipt" size={20} color="#28a745" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "إرسال إشعار دفع" : "Send Payment Receipt"}
                </Text>
                <Text style={styles.menuSubtext}>
                  {language === "ar" ? "إرفاق إيصال السداد للاشتراك" : "Attach transfer receipt"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>

            {/* Section: Management */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFD700' : '#d4af37' }]}>
              🏬 {language === "ar" ? "لوحة التحكم والمنتجات" : "Dashboard & Products"}
            </Text>

            {/* Vendor Dashboard */}
            {isLoggedIn && (
              <TouchableOpacity
                style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
                onPress={() => navigateToScreen("VendorDashboard")}
              >
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                  <Ionicons name="storefront" size={20} color="#ff9800" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                    {language === "ar" ? "لوحة منتجات التاجر" : "Vendor Dashboard"}
                  </Text>
                  <Text style={styles.menuSubtext}>
                    {language === "ar" ? "إدارة وتعديل وااشتراك المنتجات" : "Manage your items & subscription"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#888" />
              </TouchableOpacity>
            )}

            {/* Add Product (Admin or Vendor) */}
            {(isAdmin || isLoggedIn) && (
              <TouchableOpacity
                style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
                onPress={() => {
                  if (onClose) onClose();
                  if (onAddProduct) onAddProduct();
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 123, 255, 0.15)' }]}>
                  <Ionicons name="add-circle" size={20} color="#007bff" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                    {language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
                  </Text>
                  <Text style={styles.menuSubtext}>
                    {language === "ar" ? "عرض منتج جديد للمبيعات" : "List new item for sale"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#888" />
              </TouchableOpacity>
            )}

            {/* Section: Settings */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFD700' : '#d4af37' }]}>
              ⚙️ {language === "ar" ? "الإعدادات والتفضلات" : "Settings & Preferences"}
            </Text>

            {/* Language Switch */}
            <TouchableOpacity
              style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
              onPress={() => switchLanguage()}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
                <Ionicons name="language" size={20} color="#9c27b0" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "لغة التطبيق" : "App Language"}
                </Text>
                <Text style={styles.menuSubtext}>
                  {language === "ar" ? "العربية 👈 تحويل للإنجليزية" : "English 👈 Switch to Arabic"}
                </Text>
              </View>
              <View style={styles.langPill}>
                <Text style={styles.langPillText}>{language === "ar" ? "EN" : "عربي"}</Text>
              </View>
            </TouchableOpacity>

            {/* Dark Mode Switch */}
            <View style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 235, 59, 0.15)' }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? "#FFD700" : "#f57c00"} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "الوضع الليلي" : "Dark Mode"}
                </Text>
                <Text style={styles.menuSubtext}>
                  {isDarkMode
                    ? (language === "ar" ? "مفعل (المظهر الداكن)" : "Enabled (Dark)")
                    : (language === "ar" ? "معطل (المظهر الفاتح)" : "Disabled (Light)")}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => toggleTheme()}
                trackColor={{ false: '#767577', true: '#FFD700' }}
                thumbColor={isDarkMode ? '#000' : '#f4f3f4'}
              />
            </View>

            {/* Security & Privacy */}
            <TouchableOpacity
              style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
              onPress={() => navigateToScreen("SecurityPolicy")}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(233, 30, 99, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#e91e63" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "الأمان وسياسة الخصوصية" : "Security & Privacy Policy"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              style={[styles.menuItem, isDarkMode ? styles.darkMenuItem : styles.lightMenuItem]}
              onPress={() => navigateToScreen("Help")}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 188, 212, 0.15)' }]}>
                <Ionicons name="help-buoy" size={20} color="#00bcd4" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>
                  {language === "ar" ? "المساعدة والدعم الفني" : "Help & Technical Support"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>

            {/* Login / Logout Button */}
            <TouchableOpacity
              style={[
                styles.authBtn,
                isLoggedIn ? styles.logoutBtn : styles.loginBtn
              ]}
              onPress={() => {
                if (onClose) onClose();
                if (onLoginLogout) onLoginLogout();
              }}
            >
              <Ionicons
                name={isLoggedIn ? "log-out-outline" : "log-in-outline"}
                size={22}
                color={isLoggedIn ? "#ff4d4d" : "#000"}
              />
              <Text style={[styles.authBtnText, { color: isLoggedIn ? "#ff4d4d" : "#000" }]}>
                {language === "ar"
                  ? (isLoggedIn ? "تسجيل الخروج من الحساب" : "تسجيل الدخول إلى المتجر")
                  : (isLoggedIn ? "Logout Account" : "Login to Store")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerVersion}>T-REX SHOP v2.5.0 • Powered by Supabase</Text>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Bank Account Info Modal */}
      <Modal
        visible={showBankInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBankInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.darkModalContent : styles.lightModalContent]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="card-outline" size={24} color="#FFD700" />
                <Text style={[styles.modalTitle, { color: isDarkMode ? "#fff" : "#000" }]}>
                  {language === "ar" ? "معلومات الحسابات البنكية" : "Bank Transfer Accounts"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowBankInfo(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              {/* Kuraimi Bank */}
              <View style={styles.bankCard}>
                <Text style={styles.bankNameHeader}>🏦 {BANK_INFO.bankName}</Text>
                <Text style={styles.bankSubText}>{BANK_INFO.accountNumber}</Text>
                <View style={styles.copyRow}>
                  <Text style={styles.bankNumText}>{BANK_INFO.accountNumberValue}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(BANK_INFO.accountNumberValue, "حساب الكريمي")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000" />
                    <Text style={styles.copyBtnText}>{language === "ar" ? "نسخ" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Jeeb Wallet */}
              <View style={styles.bankCard}>
                <Text style={styles.bankNameHeader}>📱 {BANK_INFO.jeebWallet}</Text>
                <Text style={styles.bankSubText}>الاسم: {BANK_INFO.jeebName}</Text>
                <View style={styles.copyRow}>
                  <Text style={styles.bankNumText}>{BANK_INFO.jeebNumber}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(BANK_INFO.jeebNumber, "محفظة جيب")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000" />
                    <Text style={styles.copyBtnText}>{language === "ar" ? "نسخ" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OneCash Wallet */}
              <View style={styles.bankCard}>
                <Text style={styles.bankNameHeader}>💰 {BANK_INFO.oneCashWallet}</Text>
                <Text style={styles.bankSubText}>الاسم: {BANK_INFO.oneCashName}</Text>
                <View style={styles.copyRow}>
                  <Text style={styles.bankNumText}>{BANK_INFO.oneCashNumber}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(BANK_INFO.oneCashNumber, "محفظة ون كاش")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000" />
                    <Text style={styles.copyBtnText}>{language === "ar" ? "نسخ" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* July Wallet */}
              <View style={styles.bankCard}>
                <Text style={styles.bankNameHeader}>🌐 {BANK_INFO.julyWallet}</Text>
                <Text style={styles.bankSubText}>الاسم: {BANK_INFO.julyName}</Text>
                <View style={styles.copyRow}>
                  <Text style={styles.bankNumText}>{BANK_INFO.julyNumber}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(BANK_INFO.julyNumber, "محفظة جولي")}
                  >
                    <Ionicons name="copy-outline" size={16} color="#000" />
                    <Text style={styles.copyBtnText}>{language === "ar" ? "نسخ" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.82,
    height: "100%",
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  darkDrawer: {
    backgroundColor: "#141414",
    borderLeftWidth: 1,
    borderLeftColor: "#2a2a2a",
  },
  lightDrawer: {
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  brandInfo: {
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  menuList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  darkMenuItem: {
    backgroundColor: "#1e1e1e",
    borderColor: "#2b2b2b",
  },
  lightMenuItem: {
    backgroundColor: "#f9f9f9",
    borderColor: "#eee",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  menuSubtext: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  langPill: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langPillText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    gap: 8,
    elevation: 2,
  },
  loginBtn: {
    backgroundColor: "#FFD700",
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 77, 77, 0.12)",
    borderWidth: 1,
    borderColor: "#ff4d4d",
  },
  authBtnText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  footerVersion: {
    textAlign: "center",
    color: "#666",
    fontSize: 11,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#FFD700",
    overflow: "hidden",
  },
  darkModalContent: {
    backgroundColor: "#1c1c1c",
  },
  lightModalContent: {
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bankCard: {
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  bankNameHeader: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bankSubText: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  bankNumText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  copyBtn: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  copyBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default SidebarV2;