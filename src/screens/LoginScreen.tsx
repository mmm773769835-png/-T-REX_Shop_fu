import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/SupabaseService';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

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
      } else if (data?.url) {
        Alert.alert(
          language === "ar" ? "تنبيه" : "Notice",
          language === "ar" ? "جاري فتح متصفح Google..." : "Opening Google browser..."
        );
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

  const styles = getStyles(isDarkMode, colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {language === "ar" ? "مرحباً بك في متجر T-REX" : "Welcome to T-REX Shop"}
        </Text>
        <Text style={styles.subtitle}>
          {language === "ar" ? "تسجيل الدخول للعملاء" : "Customer Login"}
        </Text>
        
        {/* قسم تسجيل الدخول بالبريد الإلكتروني */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "تسجيل الدخول بالبريد الإلكتروني" : "Email Login"}
          </Text>
          
          <Text style={styles.label}>
            {language === "ar" ? "البريد الإلكتروني" : "Email"}
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
            {language === "ar" ? "كلمة المرور" : "Password"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading 
                ? (language === "ar" ? "جاري تسجيل الدخول..." : "Logging in...")
                : (language === "ar" ? "تسجيل الدخول" : "Login")
              }
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* قسم تسجيل الدخول برقم الهاتف */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "تسجيل الدخول برقم الهاتف" : "Phone Login"}
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.phoneButton]}
            onPress={handlePhoneLogin}
          >
            <Text style={styles.buttonText}>
              {language === "ar" ? "تسجيل الدخول برقم الهاتف" : "Login with Phone"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* قسم تسجيل الدخول عبر Google */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "أو سجل دخول باستخدام" : "Or sign in with"}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {language === "ar" ? "🌐 Google" : "🌐 Google"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* قسم الخيارات الإضافية */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "خيارات إضافية" : "Additional Options"}
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.skipButton]}
            onPress={handleSkipLogin}
          >
            <Text style={styles.buttonText}>
              {language === "ar" ? "متابعة كضيف" : "Continue as Guest"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.linkText}>
              {language === "ar" ? "ليس لديك حساب؟ سجل الآن" : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* فاصل للوصول إلى لوحة التحكم */}
        <View style={styles.adminDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.adminDividerText}>
            {language === "ar" ? "للمديرين" : "For Administrators"}
          </Text>
          <View style={styles.dividerLine} />
        </View>
        
        {/* زر الوصول إلى لوحة تحكم المدير */}
        <TouchableOpacity 
          style={[styles.button, styles.adminButton]}
          onPress={() => navigation.navigate("AdminLogin")}
        >
          <Text style={styles.buttonText}>
            {language === "ar" ? "دخول لوحة التحكم" : "Admin Panel"}
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
    marginBottom: 5,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
    textAlign: "center",
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
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.button,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  phoneButton: {
    backgroundColor: "#28a745",
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  skipButton: {
    backgroundColor: "#6c757d",
  },
  adminButton: {
    backgroundColor: "#dc3545",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
  },
  adminDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  adminDividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});