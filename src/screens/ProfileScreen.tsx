import React, { useState, useContext, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { useAuth } from "../contexts/AuthContext";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { getDefaultUserImage } from '../utils/imageUtils';
import { dbService } from '../services/SupabaseService';

const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser, signOut } = useAuth();
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  
  const [localUser, setLocalUser] = useState({
    name: "جاري التحميل...",
    email: "جاري التحميل...",
    phone: "غير متوفر",
    role: "customer",
    shopName: "",
    vendorCode: "",
    profileImage: getDefaultUserImage(),
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeName, setUpgradeName] = useState("");
  const [upgradeShopName, setUpgradeShopName] = useState("");
  const [upgradePhone, setUpgradePhone] = useState("");
  const [upgradeAddress, setUpgradeAddress] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        try {
          // جلب بيانات الحساب من profiles أولاً ثم users
          let { data, error } = await dbService.get('profiles', { eq: { id: authUser.uid } });
          if (!data || data.length === 0) {
            const res = await dbService.get('users', { eq: { id: authUser.uid } });
            data = res.data;
          }

          if (data && data.length > 0) {
            const userData = data[0];
            if (userData.role === 'deleted' || userData.vendor_code === 'DELETED' || userData.shop_name === 'حساب محذوف') {
              await signOut();
              Alert.alert(
                language === "ar" ? "حساب محذوف ❌" : "Deleted Account ❌",
                language === "ar" ? "هذا الحساب تم حذفه نهائياً ولا يمكن الدخول منه مرة أخرى." : "This account has been permanently deleted and cannot log in again."
              );
              return;
            }
            const adminEmails = ['mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com'];
            const userEmail = authUser.email || "";
            const isMasterAdmin = adminEmails.includes(userEmail.trim().toLowerCase());
            
            setLocalUser({
              name: userData.name || authUser.displayName || "مستخدم جديد",
              email: authUser.email || "غير متوفر",
              phone: userData.phone || authUser.phoneNumber || "غير متوفر",
              role: isMasterAdmin ? 'admin' : (userData.role || "customer"),
              shopName: userData.shop_name || "",
              vendorCode: userData.vendor_code || "",
              profileImage: userData.photo_url || userData.profile_image || getDefaultUserImage(),
            });
          } else {
            const adminEmails = ['mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com'];
            const userEmail = authUser.email || "";
            const isMasterAdmin = adminEmails.includes(userEmail.trim().toLowerCase());
            
            setLocalUser({
              name: authUser.displayName || "مستخدم جديد",
              email: authUser.email || "غير متوفر",
              phone: authUser.phoneNumber || "غير متوفر",
              role: isMasterAdmin ? 'admin' : "customer",
              shopName: "",
              vendorCode: "",
              profileImage: getDefaultUserImage(),
            });
          }
        } catch (error) {
          console.error("خطأ في جلب معلومات المستخدم:", error);
          const adminEmails = ['mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com'];
          const userEmail = authUser.email || "";
          const isMasterAdmin = adminEmails.includes(userEmail.trim().toLowerCase());
          
          setLocalUser({
            name: authUser.displayName || "مستخدم جديد",
            email: authUser.email || "غير متوفر",
            phone: authUser.phoneNumber || "غير متوفر",
            role: isMasterAdmin ? 'admin' : "customer",
            shopName: "",
            vendorCode: "",
            profileImage: getDefaultUserImage(),
          });
        }
      }
    };
    
    fetchUserData();
  }, [authUser]);

  const handleUpgradeToVendor = async () => {
    const finalName = upgradeName.trim() || localUser.name;
    if (!finalName || finalName === "مستخدم جديد") {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال اسم التاجر / الاسم الكامل (إجباري للحساب التجاري)" : "Please enter your full name for vendor account"
      );
      return;
    }
    if (!upgradeShopName.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال اسم المتجر" : "Please enter shop name"
      );
      return;
    }
    if (!upgradePhone.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "رقم الهاتف إجباري للحساب التجاري" : "Phone number is required for vendor account"
      );
      return;
    }
    if (!upgradeAddress.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "عنوان التاجر / المحل إجباري للحساب التجاري" : "Address is required for vendor account"
      );
      return;
    }

    setUpgrading(true);
    try {
      if (!authUser?.uid) return;
      const generatedCode = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        id: authUser.uid,
        name: finalName,
        email: localUser.email,
        phone: upgradePhone.trim(),
        shop_name: upgradeShopName.trim(),
        address: upgradeAddress.trim(),
        role: 'vendor',
        vendor_code: generatedCode,
        updated_at: new Date().toISOString(),
      };

      await dbService.upsert('profiles', payload);
      await dbService.upsert('users', payload);

      setLocalUser({
        ...localUser,
        name: finalName,
        role: 'vendor',
        shopName: upgradeShopName.trim(),
        phone: upgradePhone.trim(),
        vendorCode: generatedCode,
      });

      setShowUpgradeModal(false);
      Alert.alert(
        language === "ar" ? "تهانينا! 🎉" : "Congratulations! 🎉",
        language === "ar" 
          ? `تم ترقية حسابك إلى تاجر بنجاح! كود التاجر الخاص بك هو: ${generatedCode}`
          : `Your account has been upgraded to vendor! Your vendor code is: ${generatedCode}`
      );
    } catch (err) {
      console.error("Upgrade error:", err);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في ترقية الحساب" : "Failed to upgrade account"
      );
    } finally {
      setUpgrading(false);
    }
  };
  
  const styles = getStyles(isDarkMode, colors);

  const menuItems = [
    { 
      id: "1", 
      title: language === "ar" ? "طلباتي" : "My Orders", 
      icon: "receipt-outline", 
      screen: "OrderHistory" 
    },
    { 
      id: "2", 
      title: language === "ar" ? "عناويني" : "My Addresses", 
      icon: "location-outline", 
      screen: "Addresses" 
    },
    { 
      id: "3", 
      title: language === "ar" ? "قائمة الأمنيات" : "Wishlist", 
      icon: "heart-outline", 
      screen: "WishList" 
    },
    { 
      id: "4", 
      title: language === "ar" ? "الإعدادات" : "Settings", 
      icon: "settings-outline", 
      screen: "Settings" 
    },
    { 
      id: "5", 
      title: language === "ar" ? "المساعدة" : "Help", 
      icon: "help-circle-outline", 
      screen: "Help" 
    },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a real app, you would upload this to your server
      setLocalUser({
        ...localUser,
        profileImage: result.assets[0].uri,
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      language === "ar" ? "تسجيل الخروج" : "Logout",
      language === "ar" ? "هل أنت متأكد أنك تريد تسجيل الخروج؟" : "Are you sure you want to logout?",
      [
        { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
        { 
          text: language === "ar" ? "تسجيل الخروج" : "Logout", 
          onPress: async () => {
            await signOut();
            // @ts-ignore
            navigation.navigate("Login");
          } 
        },
      ]
    );
  };

  const handleDeleteMyAccount = () => {
    Alert.alert(
      language === "ar" ? "حذف الحساب نهائياً 🗑️" : "Delete Account Permanently",
      language === "ar"
        ? "هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ سيتم حذف جميع بياناتك وتفاصيل ملفك الشخصي."
        : "Are you sure you want to permanently delete your account? All your profile data will be deleted.",
      [
        { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد الحذف" : "Confirm Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (authUser?.uid) {
                if (localUser.role === 'vendor') {
                  await dbService.delete('products', { eq: { vendor_id: authUser.uid } });
                }
                await dbService.upsert('profiles', {
                  id: authUser.uid,
                  email: authUser.email,
                  role: 'deleted',
                  vendor_code: 'DELETED',
                  shop_name: 'حساب محذوف',
                  name: 'حساب محذوف',
                  featured_until: null,
                  updated_at: new Date().toISOString()
                });
              }
              await signOut();
              Alert.alert(
                language === "ar" ? "تم الحذف" : "Deleted",
                language === "ar" ? "تم حذف حسابك بنجاح" : "Your account has been deleted"
              );
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { loggedIn: false, admin: false } }],
              });
            } catch (err) {
              console.error("Delete account error:", err);
              Alert.alert(
                language === "ar" ? "خطأ" : "Error",
                language === "ar" ? "فشل في حذف الحساب" : "Failed to delete account"
              );
            }
          },
        },
      ]
    );
  };

  const handleMenuItemPress = (screen: string) => {
    // @ts-ignore
    navigation.navigate(screen);
  };

  const isGuest = !authUser;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{language === "ar" ? "حسابي" : "My Profile"}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {isGuest ? (
          <View style={styles.guestSection}>
            <View style={styles.guestIconWrapper}>
              <Ionicons name="person-outline" size={50} color="#FFD700" />
            </View>
            <Text style={styles.guestTitle}>
              {language === "ar" ? "مرحباً بك 👋" : "Welcome 👋"}
            </Text>
            <Text style={styles.guestSub}>
              {language === "ar" ? "سجل دخولك للوصول لحسابك" : "Sign in to access your account"}
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login" as never)}>
              <Ionicons name="log-in-outline" size={20} color="#1a1a1a" />
              <Text style={styles.loginBtnText}>
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userSection}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              <Image source={{ uri: localUser.profileImage }} style={styles.profileImage} />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={14} color="#1a1a1a" />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{localUser.name}</Text>
            <Text style={styles.userEmail}>{localUser.email}</Text>
            {localUser.phone !== "غير متوفر" && (
              <Text style={styles.userPhone}>{localUser.phone}</Text>
            )}

            {/* شارة التاجر إذا كان تاجر */}
            {localUser.role === 'vendor' && (
              <View style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e8f8ec', borderRadius: 20, borderWidth: 1, borderColor: '#28a745', alignItems: 'center' }}>
                <Text style={{ color: '#28a745', fontWeight: 'bold', fontSize: 13 }}>
                  🏬 {localUser.shopName || "متجر تاجر"} | {localUser.vendorCode}
                </Text>
              </View>
            )}

            {/* شارة مدير النظام إذا كان أدمن */}
            {localUser.role === 'admin' && (
              <View style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#fff9e6', borderRadius: 20, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center' }}>
                <Text style={{ color: '#b8860b', fontWeight: 'bold', fontSize: 13 }}>
                  👑 {language === "ar" ? "مدير النظام (Super Admin)" : "Super Admin"}
                </Text>
              </View>
            )}

            {/* زر الترقية إلى تاجر إذا كان زبون عادي */}
            {localUser.role !== 'vendor' && localUser.role !== 'admin' && (
              <TouchableOpacity
                style={{
                  marginTop: 14,
                  backgroundColor: '#FFD700',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
                onPress={() => {
                  setUpgradeName(localUser.name && localUser.name !== "مستخدم جديد" ? localUser.name : "");
                  setUpgradePhone(localUser.phone && localUser.phone !== "غير متوفر" ? localUser.phone : "");
                  setShowUpgradeModal(true);
                }}
              >
                <Ionicons name="storefront-outline" size={18} color="#1a1a1a" />
                <Text style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: 14 }}>
                  {language === "ar" ? "التحويل لحساب تاجر 🏪" : "Upgrade to Vendor Account 🏪"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* لوحة التاجر إذا كان تاجر أو أدمن */}
      {!isGuest && (localUser.role === 'vendor' || localUser.role === 'admin') && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#28a745',
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              elevation: 2,
            }}
            onPress={() => navigation.navigate("VendorDashboard" as never)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="cube-outline" size={24} color="#fff" />
              <View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  {language === "ar" ? "لوحة منتجات التاجر" : "Vendor Dashboard"}
                </Text>
                <Text style={{ color: '#e8f8ec', fontSize: 12 }}>
                  {language === "ar" ? "إضافة وتعديل وحذف منتجاتك" : "Manage your products"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* قسم إدارة التجار للمدير فقط */}
      {!isGuest && localUser.role === 'admin' && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#17a2b8',
              padding: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              elevation: 2,
            }}
            onPress={() => navigation.navigate("AdminVendors" as never)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="people-outline" size={24} color="#fff" />
              <View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  {language === "ar" ? "دليل وبحث كود التجار (Admin)" : "Vendor Codes & Search"}
                </Text>
                <Text style={{ color: '#e1f5fe', fontSize: 12 }}>
                  {language === "ar" ? "البحث بـ VND-XXXX والتواصل المباشر" : "Lookup vendor details"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => handleMenuItemPress(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconWrapper}>
                <Ionicons name={item.icon as any} size={20} color="#FFD700" />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#555" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout & Delete Account */}
      {!isGuest && (
        <View style={{ gap: 10 }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B3B" />
            <Text style={styles.logoutBtnText}>
              {language === "ar" ? "تسجيل الخروج" : "Logout"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#2c1515' : '#fff0f0', borderColor: '#FF3B3B', borderWidth: 1 }]} 
            onPress={handleDeleteMyAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
            <Text style={[styles.logoutBtnText, { color: "#dc3545" }]}>
              {language === "ar" ? "حذف الحساب نهائياً 🗑️" : "Delete Account Permanently"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />

      {/* نافذة ترقية الحساب إلى تاجر */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FFD700' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                {language === "ar" ? "الترقية إلى حساب تاجر 🏪" : "Upgrade to Vendor Account"}
              </Text>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 15 }}>
              {language === "ar" 
                ? "أدخل بيانات متجرك للبدء في إضافة وعرض منتجاتك واستقبال الطلبات."
                : "Enter your shop details to start adding products and managing orders."}
            </Text>

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
              {language === "ar" ? "اسم التاجر / الاسم الكامل *" : "Full Name *"}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 15,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholder={language === "ar" ? "أدخل اسمك الكامل" : "Enter full name"}
              value={upgradeName}
              onChangeText={setUpgradeName}
            />

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
              {language === "ar" ? "اسم المتجر *" : "Shop Name *"}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 15,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholder={language === "ar" ? "مثال: متجر الأناقة" : "e.g. Elegance Shop"}
              value={upgradeShopName}
              onChangeText={setUpgradeShopName}
            />

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
              {language === "ar" ? "رقم الهاتف للتواصل *" : "Phone Number *"}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 15,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                marginBottom: 12,
              }}
              placeholder={language === "ar" ? "أدخل رقم هاتفك" : "Enter phone number"}
              value={upgradePhone}
              onChangeText={setUpgradePhone}
              keyboardType="phone-pad"
            />

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
              {language === "ar" ? "العنوان *" : "Address *"}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 15,
                backgroundColor: colors.inputBackground,
                color: colors.text,
                marginBottom: 20,
              }}
              placeholder={language === "ar" ? "أدخل عنوان المتجر" : "Enter shop address"}
              value={upgradeAddress}
              onChangeText={setUpgradeAddress}
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#28a745',
                padding: 14,
                borderRadius: 10,
                alignItems: 'center',
                opacity: upgrading ? 0.7 : 1,
              }}
              onPress={handleUpgradeToVendor}
              disabled={upgrading}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {upgrading 
                  ? (language === "ar" ? "جاري الترقية..." : "Upgrading...")
                  : (language === "ar" ? "تأكيد الترقية وتوليد كود التاجر" : "Confirm Upgrade")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? "#111" : "#f0f0f0",
  },
  header: {
    backgroundColor: "#1a1a1a",
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 1,
  },
  profileCard: {
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  guestSection: {
    alignItems: "center",
    padding: 28,
  },
  guestIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 6,
  },
  guestSub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  loginBtn: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  loginBtnText: {
    color: "#1a1a1a",
    fontWeight: "800",
    fontSize: 15,
  },
  userSection: {
    alignItems: "center",
    padding: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 14,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: "#888",
  },
  menuSection: {
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: isDarkMode ? "#fff" : "#1a1a1a",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF3B3B",
  },
  logoutBtnText: {
    color: "#FF3B3B",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ProfileScreen;