import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { authService, storageService } from '../services/SupabaseService';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { getDefaultUserImage } from '../utils/imageUtils';

export default function RegisterScreen({ navigation }: any) {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const styles = getStyles(isDarkMode, colors);

  const pickImage = async () => {
    try {
      // طلب إذن الوصول إلى المعرض
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          language === "ar" ? "نحتاج إلى إذن للوصول إلى المعرض" : "We need permission to access the gallery"
        );
        return;
      }

      // فتح محدد الصور
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في اختيار الصورة" : "Failed to pick image"
      );
    }
  };

  const uploadProfileImage = async (imageUri: string): Promise<string> => {
    try {
      if (!imageUri || imageUri.startsWith('http')) {
        return imageUri || getDefaultUserImage();
      }

      console.log("📤 بدء رفع صورة الملف الشخصي...");
      
      const timestamp = Date.now();
      const filename = `profiles/user_${timestamp}.jpg`;
      
      // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // رفع الصورة إلى Supabase Storage
      const { data, error } = await storageService.upload('profile-images', filename, blob);
      
      if (error) {
        console.error("❌ خطأ في رفع صورة الملف الشخصي:", error);
        return getDefaultUserImage();
      }
      
      const downloadURL = storageService.getPublicUrl('profile-images', filename);
      
      console.log(`📤 رفع صورة الملف الشخصي إلى Supabase Storage: ${filename}`);
      console.log(`✅ تم رفع صورة الملف الشخصي: ${downloadURL}`);
      return downloadURL;
    } catch (error: any) {
      console.error("❌ خطأ في رفع صورة الملف الشخصي:", error);
      console.error("تفاصيل الخطأ:", error?.message || error);
      // في حالة الفشل، نستخدم الصورة الافتراضية
      return getDefaultUserImage();
    }
  };

  const handleRegister = async () => {
    // التحقق من صحة المدخلات
    if (!name.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال الاسم" : "Please enter your name"
      );
      return;
    }

    // التحقق من أن الاسم لا يحتوي على أحرف خاصة
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط" : "Name can only contain Arabic or English letters"
      );
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "الاسم يجب أن يكون بين 3 و 50 حرف" : "Name must be between 3 and 50 characters"
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email"
      );
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email address"
      );
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      return;
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 8) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters"
      );
      return;
    }

    // التحقق من أن كلمة المرور تحتوي على أرقام وحروف
    const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "كلمة المرور يجب أن تحتوي على أحرف وأرقام على الأقل" : "Password must contain at least one letter and one number"
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match"
      );
      return;
    }

    setLoading(true);
    try {
      // رفع صورة الملف الشخصي إذا كانت موجودة
      let photoURL = getDefaultUserImage();
      if (profileImage) {
        photoURL = await uploadProfileImage(profileImage);
      }

      // إنشاء الحساب مع جميع البيانات
      const additionalData = {
        name: name.trim(),
        phone: phone.trim() || "",
        photoURL: photoURL,
        displayName: name.trim(),
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await authService.signUp(email, password);
      if (error) {
        // عرض رسالة خطأ واضحة
        let errorMessage = error.message;
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          errorMessage = language === "ar" 
            ? "هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول."
            : "This email is already in use. Please use another email or sign in.";
        }
        
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          errorMessage,
          [
            {
              text: language === "ar" ? "حسناً" : "OK"
            },
            {
              text: language === "ar" ? "تسجيل الدخول" : "Sign In",
              onPress: () => navigation.navigate("Login"),
              style: "default"
            }
          ]
        );
      } else {
        Alert.alert(
          language === "ar" ? "نجاح" : "Success",
          language === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created successfully",
          [
            {
              text: language === "ar" ? "حسناً" : "OK",
              onPress: () => {
                navigation.replace("MainTabs", { 
                  loggedIn: true,
                  admin: false
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في إنشاء الحساب" : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {language === "ar" ? "إنشاء حساب جديد" : "Create New Account"}
        </Text>
        
        {/* رفع صورة الملف الشخصي */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>
            {language === "ar" ? "صورة الملف الشخصي" : "Profile Picture"}
          </Text>
          <TouchableOpacity 
            style={styles.imagePicker}
            onPress={pickImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color={isDarkMode ? "#666" : "#999"} />
                <Text style={styles.imagePlaceholderText}>
                  {language === "ar" ? "اضغط لاختيار صورة" : "Tap to select image"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          {language === "ar" ? "الاسم الكامل *" : "Full Name *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        
        <Text style={styles.label}>
          {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          {language === "ar" ? "رقم الهاتف" : "Phone Number"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل رقم هاتفك (اختياري)" : "Enter your phone (optional)"}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>
          {language === "ar" ? "كلمة المرور *" : "Password *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Text style={styles.label}>
          {language === "ar" ? "تأكيد كلمة المرور *" : "Confirm Password *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter your password"}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading 
              ? (language === "ar" ? "جاري إنشاء الحساب..." : "Creating account...")
              : (language === "ar" ? "إنشاء حساب" : "Create Account")
            }
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>
            {language === "ar" ? "لديك حساب بالفعل؟ سجل الدخول" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  form: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
  },
});