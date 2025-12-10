import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser } = useAuth();
  
  const [localUser, setLocalUser] = useState({
    name: authUser?.displayName || "مستخدم جديد",
    email: authUser?.email || "غير متوفر",
    phone: authUser?.phoneNumber || "غير متوفر",
    profileImage: "https://via.placeholder.com/150/007bff/FFFFFF?text=U",
  });

  const menuItems = [
    { 
      id: "1", 
      title: "طلباتي", 
      icon: "receipt-outline", 
      screen: "OrderHistory" 
    },
    { 
      id: "2", 
      title: "عناويني", 
      icon: "location-outline", 
      screen: "Addresses" 
    },
    { 
      id: "3", 
      title: "ال wishlist", 
      icon: "heart-outline", 
      screen: "Wishlist" 
    },
    { 
      id: "4", 
      title: "الإعدادات", 
      icon: "settings-outline", 
      screen: "Settings" 
    },
    { 
      id: "5", 
      title: "المساعدة", 
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
      "تسجيل الخروج",
      "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "تسجيل الخروج", 
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
        <Text style={styles.headerTitle}>حسابي</Text>
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
              <Ionicons name={item.icon as any} size={24} color="#007bff" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutSection}>
        <Button 
          title="تسجيل الخروج" 
          onPress={handleLogout} 
          variant="outline" 
        />
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
    backgroundColor: "#007bff",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  profileSection: {
    backgroundColor: "#fff",
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
    backgroundColor: "#007bff",
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
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: "#666",
  },
  menuSection: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#eee",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginRight: 16,
  },
  logoutSection: {
    margin: 16,
  },
});

export default ProfileScreen;