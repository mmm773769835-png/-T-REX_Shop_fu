import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Switch,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { getDefaultUserImage } from '../../utils/imageUtils';
import { storageService } from '../../services/SupabaseService';

const { width } = Dimensions.get("window");

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  userData?: {
    name: string;
    phone: string;
    photoURL?: string;
  };
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  visible,
  onClose,
  onLogout,
  userData,
}) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { language, switchLanguage } = useContext(LanguageContext);
  const [slideAnim] = useState(new Animated.Value(width));
  const [image, setImage] = useState<string | null>(userData?.photoURL || null);

  const uploadProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert(language === 'ar' ? "❌ نحتاج إلى إذن للوصول إلى المعرض" : "❌ We need permission to access the gallery");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      const filename = `profiles/user-${Date.now()}.jpg`;

      // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
      const response = await fetch(uri);
      const blob = await response.blob();

      // رفع الصورة إلى Supabase Storage
      const { data, error } = await storageService.upload('profile-images', filename, blob);

      if (error) {
        console.error('Error uploading image:', error);
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'فشل في رفع الصورة' : 'Failed to upload image'
        );
        return;
      }

      const downloadURL = storageService.getPublicUrl('profile-images', filename);
      setImage(downloadURL);
    }
  };

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        isDarkMode && styles.darkSidebar,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={uploadProfileImage}>
          <Image
            source={
              image
                ? { uri: image }
                : { uri: getDefaultUserImage() }
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={[styles.name, isDarkMode && styles.darkName]}>
          {userData?.name || (language === "ar" ? "مستخدم جديد" : "New User")}
        </Text>
        <Text style={[styles.phone, isDarkMode && styles.darkPhone]}>
          {userData?.phone || (language === "ar" ? "غير معروف" : "Unknown")}
        </Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity 
          style={[styles.option, isDarkMode && styles.darkOption]} 
          onPress={switchLanguage}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>🌐</Text>
            <Text style={[styles.optionText, isDarkMode && styles.darkOptionText]}>
              {language === "ar" ? "تبديل اللغة" : "Switch Language"}
            </Text>
          </View>
          <View style={[styles.languageBadge, isDarkMode && styles.darkLanguageBadge]}>
            <Text style={[styles.languageBadgeText, isDarkMode && styles.darkLanguageBadgeText]}>
              {language === "ar" ? "EN" : "AR"}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.option, isDarkMode && styles.darkOption]}>
          <View style={styles.optionLeft}>
            <Text style={styles.optionIcon}>🌙</Text>
            <Text style={[styles.optionText, isDarkMode && styles.darkOptionText]}>
              {language === "ar" ? "الوضع الليلي" : "Dark Mode"}
            </Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#4da6ff' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={[styles.optionText, isDarkMode && styles.darkOptionText]}>{language === 'ar' ? "💳 طرق الدفع" : "💳 Payment Methods"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={[styles.optionText, isDarkMode && styles.darkOptionText]}>{language === 'ar' ? "📦 طلباتي السابقة" : "📦 My Orders"}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.option, 
            { borderTopWidth: 1, borderColor: isDarkMode ? "#444" : "#ccc" }
          ]} 
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: "red" }]}>
            🚪 {language === "ar" ? "تسجيل الخروج" : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.overlay} onPress={onClose} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#fff",
    elevation: 10,
    zIndex: 100,
    padding: 20,
  },
  darkSidebar: {
    backgroundColor: "#1e1e1e",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  darkName: {
    color: "#fff",
  },
  phone: {
    fontSize: 14,
    color: "#555",
  },
  darkPhone: {
    color: "#ccc",
  },
  options: {
    marginTop: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  darkOption: {
    backgroundColor: "#2a2a2a",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  darkOptionText: {
    color: "#fff",
  },
  languageBadge: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: "center",
  },
  darkLanguageBadge: {
    backgroundColor: "#4da6ff",
  },
  languageBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  darkLanguageBadgeText: {
    color: "#fff",
  },
});

export default ProfileSidebar;
