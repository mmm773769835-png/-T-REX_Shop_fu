import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, Modal, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SidebarProps {
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onAddProduct: () => void;
  onLoginLogout: () => void;
  isDarkMode: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  currentLanguage: "ar" | "en";
}

const SidebarV2: React.FC<SidebarProps> = ({
  onToggleLanguage,
  onToggleTheme,
  onAddProduct,
  onLoginLogout,
  isDarkMode,
  isAdmin,
  isLoggedIn,
  currentLanguage,
}) => {
  const [open, setOpen] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);

  // 🏦 معلومات الحساب البنكي
  const BANK_INFO = {
    bankName: "البنك التجاري",
    accountNumber: "1234567890",
    iban: "SA03800000001234567890",
    accountName: "متجر T-REX"
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer, open && styles.open]}>
      {/* زر الإعدادات في الجهة اليسرى */}
      <TouchableOpacity 
        onPress={() => setOpen(!open)} 
        style={[styles.toggleButton, isDarkMode && styles.darkToggleButton]}
      >
        <Ionicons 
          name={open ? "close" : "menu"} 
          size={28} 
          color={isDarkMode ? "#fff" : "#000"} 
        />
      </TouchableOpacity>

      {open && (
        <View style={[styles.menu, isDarkMode && styles.darkMenu]}>
          {/* معلومات الحساب البنكي */}
          <TouchableOpacity 
            style={styles.option} 
            onPress={() => setShowBankInfo(true)}
          >
            <Ionicons name="card-outline" size={22} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={[styles.text, isDarkMode && styles.darkText]}>
              {currentLanguage === "ar" ? "معلومات الحساب البنكي" : "Bank Account Info"}
            </Text>
          </TouchableOpacity>

          {/* إرسال إشعار دفع */}
          <TouchableOpacity 
            style={styles.option} 
            onPress={() => {
              // هنا يمكن إضافة وظيفة إرسال إشعار الدفع
              Alert.alert(
                currentLanguage === "ar" ? "إرسال إشعار دفع" : "Send Payment Notification",
                currentLanguage === "ar" ? "يرجى إرفاق صورة الإيصال" : "Please attach payment receipt"
              );
            }}
          >
            <Ionicons name="receipt-outline" size={22} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={[styles.text, isDarkMode && styles.darkText]}>
              {currentLanguage === "ar" ? "إرسال إشعار دفع" : "Send Payment Notification"}
            </Text>
          </TouchableOpacity>

          {/* إضافة منتج - يظهر فقط للمشرفين */}
          {isAdmin && (
            <TouchableOpacity style={styles.option} onPress={onAddProduct}>
              <Ionicons name="add-circle-outline" size={22} color={isDarkMode ? "#fff" : "#000"} />
              <Text style={[styles.text, isDarkMode && styles.darkText]}>
                {currentLanguage === "ar" ? "إضافة منتج جديد" : "Add Product"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.option}>
            <Ionicons name="language-outline" size={22} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={[styles.text, isDarkMode && styles.darkText]}>
              {currentLanguage === "ar" ? "اللغة: العربية" : "Language: English"}
            </Text>
            <TouchableOpacity onPress={onToggleLanguage}>
              <Text style={styles.link}>
                {currentLanguage === "ar" ? "EN" : "AR"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.option}>
            <Ionicons name="moon-outline" size={22} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={[styles.text, isDarkMode && styles.darkText]}>
              {currentLanguage === "ar" ? "الوضع الليلي" : "Dark Mode"}
            </Text>
            <Switch value={isDarkMode} onValueChange={onToggleTheme} />
          </View>

          <TouchableOpacity style={styles.option} onPress={onLoginLogout}>
            <Ionicons 
              name={isLoggedIn ? "log-out-outline" : "log-in-outline"} 
              size={22} 
              color={isDarkMode ? "#fff" : "#000"} 
            />
            <Text style={[styles.text, isDarkMode && styles.darkText]}>
              {currentLanguage === "ar" 
                ? (isLoggedIn ? "تسجيل الخروج" : "تسجيل الدخول")
                : (isLoggedIn ? "Logout" : "Login")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* نافذة معلومات الحساب البنكي */}
      <Modal
        visible={showBankInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBankInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                {currentLanguage === "ar" ? "معلومات الحساب البنكي" : "Bank Account Information"}
              </Text>
              <TouchableOpacity onPress={() => setShowBankInfo(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.bankInfoContainer}>
              <View style={styles.bankInfoItem}>
                <Text style={[styles.bankInfoLabel, isDarkMode && styles.darkText]}>
                  {currentLanguage === "ar" ? "اسم البنك" : "Bank Name"}
                </Text>
                <Text style={[styles.bankInfoValue, isDarkMode && styles.darkText]}>
                  {BANK_INFO.bankName}
                </Text>
              </View>
              
              <View style={styles.bankInfoItem}>
                <Text style={[styles.bankInfoLabel, isDarkMode && styles.darkText]}>
                  {currentLanguage === "ar" ? "رقم الحساب" : "Account Number"}
                </Text>
                <Text style={[styles.bankInfoValue, isDarkMode && styles.darkText]}>
                  {BANK_INFO.accountNumber}
                </Text>
              </View>
              
              <View style={styles.bankInfoItem}>
                <Text style={[styles.bankInfoLabel, isDarkMode && styles.darkText]}>
                  {currentLanguage === "ar" ? "الآيبان" : "IBAN"}
                </Text>
                <Text style={[styles.bankInfoValue, isDarkMode && styles.darkText]}>
                  {BANK_INFO.iban}
                </Text>
              </View>
              
              <View style={styles.bankInfoItem}>
                <Text style={[styles.bankInfoLabel, isDarkMode && styles.darkText]}>
                  {currentLanguage === "ar" ? "اسم الحساب" : "Account Name"}
                </Text>
                <Text style={[styles.bankInfoValue, isDarkMode && styles.darkText]}>
                  {BANK_INFO.accountName}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkContainer: {
    backgroundColor: "#2a2a2a",
  },
  open: {
    width: 250,
    height: "auto",
  },
  toggleButton: {
    alignSelf: "flex-start",
  },
  darkToggleButton: {
    // يمكن إضافة أنماط إضافية للوضع الليلي
  },
  menu: {
    marginTop: 10,
  },
  darkMenu: {
    // أنماط إضافية للوضع الليلي
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    color: "#000",
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  darkText: {
    color: "#fff",
  },
  link: {
    color: "#007bff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxHeight: "70%",
  },
  darkModalContent: {
    backgroundColor: "#2a2a2a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  darkModalTitle: {
    color: "#fff",
  },
  bankInfoContainer: {
    padding: 20,
  },
  bankInfoItem: {
    marginBottom: 15,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  bankInfoValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});

export default SidebarV2;