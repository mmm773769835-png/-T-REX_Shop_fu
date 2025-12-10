import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();

const { width } = Dimensions.get("window");

interface ProfileSidebarProps {
  visible: boolean;
  onClose: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
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
  onToggleLanguage,
  onToggleTheme,
  onLogout,
  userData,
}) => {
  const [slideAnim] = useState(new Animated.Value(width));
  const [image, setImage] = useState<string | null>(userData?.photoURL || null);

  const uploadProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `profiles/user-${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
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
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={uploadProfileImage}>
          <Image
            source={
              image
                ? { uri: image }
                : { uri: "https://via.placeholder.com/150/007bff/FFFFFF?text=User" }
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{userData?.name || "مستخدم جديد"}</Text>
        <Text style={styles.phone}>{userData?.phone || "غير معروف"}</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity style={styles.option} onPress={onToggleLanguage}>
          <Text style={styles.optionText}>🌐 تبديل اللغة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onToggleTheme}>
          <Text style={styles.optionText}>🌙 الوضع الليلي / النهاري</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>💳 طرق الدفع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📦 طلباتي السابقة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, { borderTopWidth: 1, borderColor: "#ccc" }]} onPress={onLogout}>
          <Text style={[styles.optionText, { color: "red" }]}>🚪 تسجيل الخروج</Text>
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
  },
  phone: {
    fontSize: 14,
    color: "#555",
  },
  options: {
    marginTop: 20,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ProfileSidebar;
