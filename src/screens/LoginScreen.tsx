import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/SupabaseService';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import supabase from '../services/SupabaseService';

export default function LoginScreen({ navigation }: any) {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          error.message || (language === "ar" ? "فشل تسجيل الدخول" : "Login failed")
        );
      } else {
        Alert.alert(
          language === "ar" ? "نجاح" : "Success",
          language === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful"
        );
        // تمرير معلومات تسجيل الدخول إلى الشاشة الرئيسية
        console.log('Navigating to MainTabs screen with login');
        navigation.navigate("MainTabs", { 
          loggedIn: true,
          admin: true // سيتم التحقق من الدور لاحقًا في الشاشة الرئيسية
        });
      }
    } catch (error) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  // وظيفة لتخطي تسجيل الدخول
  const handleSkipLogin = () => {
    console.log('Navigating to MainTabs screen');
    console.log('Available navigation routes:', navigation.getState?.());
    navigation.navigate("MainTabs", { 
      loggedIn: false,
      admin: false
    });
  };

  // الانتقال إلى شاشة تسجيل الدخول عبر الهاتف
  const handlePhoneLogin = () => {
    navigation.navigate("PhoneLogin");
  };

  // مراقبة التغييرات في حالة المصادقة (للعودة بعد Google)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigation.navigate("MainTabs", { loggedIn: true, admin: false });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await authService.signInWithGoogle();
      if (error) {
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          error.message || (language === "ar" ? "فشل تسجيل الدخول عبر Google" : "Google Sign-In failed")
        );
        setLoading(false);
      } else if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (error) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login"
      );
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode, colors);

  const [showPass, setShowPass] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>T-REX</Text>
        <Text style={styles.logoSub}>{language === "ar" ? "المتجر" : "SHOP"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          {language === "ar" ? "مرحباً بك 👋" : "Welcome Back 👋"}
        </Text>
        <Text style={styles.subtitle}>
          {language === "ar" ? "سجل دخولك للمتابعة" : "Sign in to continue"}
        </Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={language === "ar" ? "كلمة المرور" : "Password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholderTextColor="#666"
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {loading ? (language === "ar" ? "جاري الدخول..." : "Signing in...") : (language === "ar" ? "تسجيل الدخول" : "Sign In")}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{language === "ar" ? "أو" : "OR"}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleBtnIcon}>G</Text>
          <Text style={styles.googleBtnText}>
            {language === "ar" ? "الدخول بـ Google" : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Guest Button */}
        <TouchableOpacity style={styles.guestBtn} onPress={handleSkipLogin}>
          <Ionicons name="person-outline" size={16} color="#888" />
          <Text style={styles.guestBtnText}>
            {language === "ar" ? "متابعة كضيف" : "Continue as Guest"}
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLinkText}>
            {language === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
            <Text style={styles.registerLinkBold}>
              {language === "ar" ? "سجل الآن" : "Sign Up"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    padding: 20,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 6,
  },
  logoSub: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 6,
    marginTop: -4,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#fff",
  },
  loginBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
    elevation: 3,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "900",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#333" },
  dividerText: { fontSize: 13, color: "#666", fontWeight: "600" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 12,
  },
  googleBtnIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4285F4",
  },
  googleBtnText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "700",
  },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginBottom: 16,
  },
  guestBtnText: { color: "#888", fontSize: 14, fontWeight: "600" },
  registerLink: { alignItems: "center" },
  registerLinkText: { fontSize: 14, color: "#888" },
  registerLinkBold: { color: "#FFD700", fontWeight: "700" },
  form: {},
  section: {},
  sectionTitle: {},
  label: {},
  button: {},
  phoneButton: {},
  googleButton: {},
  skipButton: {},
  adminButton: {},
  disabledButton: {},
  buttonText: {},
  linkButton: {},
  linkText: {},
  adminDivider: {},
  dividerLine2: {},
  adminDividerText: {},
});