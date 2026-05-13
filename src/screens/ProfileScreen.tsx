import React, { useState, useContext, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { useAuth } from "../contexts/AuthContext";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { getDefaultUserImage } from '../utils/imageUtils';
import { dbService } from '../services/SupabaseService';

const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser } = useAuth();
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  
  const [localUser, setLocalUser] = useState({
    name: "جاري التحميل...",
    email: "جاري التحميل...",
    phone: "جاري التحميل...",
    profileImage: getDefaultUserImage(),
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        try {
          // محاولة الحصول على معلومات المستخدم من قاعدة البيانات
          const { data, error } = await dbService.get('users', { eq: { id: authUser.uid } });

          if (data && data.length > 0) {
            const userData = data[0];
            setLocalUser({
              name: userData.name || authUser.displayName || "مستخدم جديد",
              email: authUser.email || "غير متوفر",
              phone: userData.phone || authUser.phoneNumber || "غير متوفر",
              profileImage: userData.photo_url || getDefaultUserImage(),
            });
          } else {
            // إذا لم يتم العثور على المستخدم في قاعدة البيانات، نستخدم معلومات auth فقط
            setLocalUser({
              name: authUser.displayName || "مستخدم جديد",
              email: authUser.email || "غير متوفر",
              phone: authUser.phoneNumber || "غير متوفر",
              profileImage: getDefaultUserImage(),
            });
          }
        } catch (error) {
          console.error("خطأ في جلب معلومات المستخدم:", error);
          setLocalUser({
            name: authUser.displayName || "مستخدم جديد",
            email: authUser.email || "غير متوفر",
            phone: authUser.phoneNumber || "غير متوفر",
            profileImage: getDefaultUserImage(),
          });
        }
      }
    };
    
    fetchUserData();
  }, [authUser]);
  
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
          onPress: () => {
            // @ts-ignore
            navigation.navigate("Login");
          } 
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
          </View>
        )}
      </View>

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

      {/* Logout */}
      {!isGuest && (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B3B" />
          <Text style={styles.logoutBtnText}>
            {language === "ar" ? "تسجيل الخروج" : "Logout"}
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 30 }} />
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