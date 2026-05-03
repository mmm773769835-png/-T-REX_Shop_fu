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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{language === "ar" ? "حسابي" : "My Profile"}</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
          <Image 
            source={{ uri: localUser.profileImage }} 
            style={styles.profileImage} 
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>{localUser.name}</Text>
        <Text style={styles.userEmail}>{localUser.email}</Text>
        <Text style={styles.userPhone}>{localUser.phone}</Text>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuItemPress(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={isDarkMode ? '#4da6ff' : '#007bff'} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#999' : '#999'} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutSection}>
        <Button 
          title={language === "ar" ? "تسجيل الخروج" : "Logout"} 
          onPress={handleLogout} 
          variant="outline" 
        />
      </View>
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.header,
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  profileSection: {
    backgroundColor: colors.card,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 16,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginRight: 16,
    color: colors.text,
  },
  logoutSection: {
    margin: 16,
  },
});

export default ProfileScreen;