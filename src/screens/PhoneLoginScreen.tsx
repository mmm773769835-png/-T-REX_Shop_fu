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
import { authService } from '../services/SupabaseService';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

export default function PhoneLoginScreen({ navigation }: any) {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const styles = getStyles(isDarkMode, colors);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert(language === 'ar' ? "خطأ" : "Error", language === 'ar' ? "يرجى إدخال رقم الهاتف" : "Please enter phone number");
      return;
    }

    setLoading(true);
    try {
      // التأكد من أن رقم الهاتف يبدأ برمز البلد
      let fullPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith("+")) {
        fullPhoneNumber = "+966" + phoneNumber; // افتراضيًا السعودية
      }

      // Supabase Phone Auth - إرسال رمز التحقق
      const { data, error } = await authService.signInWithOtp({
        phone: fullPhoneNumber,
      });

      if (error) {
        Alert.alert(language === 'ar' ? "خطأ" : "Error", error.message);
      } else {
        setShowConfirmation(true);
        Alert.alert(language === 'ar' ? "نجاح" : "Success", language === 'ar' ? "تم إرسال رمز التحقق إلى هاتفك" : "Verification code sent to your phone");
      }
    } catch (error) {
      Alert.alert(language === 'ar' ? "خطأ" : "Error", language === 'ar' ? "فشل في إرسال رمز التحقق" : "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert(language === 'ar' ? "خطأ" : "Error", language === 'ar' ? "يرجى إدخال رمز التحقق" : "Please enter verification code");
      return;
    }

    setLoading(true);
    try {
      // التأكد من أن رقم الهاتف يبدأ برمز البلد
      let fullPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith("+")) {
        fullPhoneNumber = "+966" + phoneNumber;
      }

      // Supabase Phone Auth - التحقق من الرمز
      const { data, error } = await authService.verifyOtp({
        phone: fullPhoneNumber,
        token: verificationCode,
        type: 'sms',
      });

      if (error) {
        Alert.alert(language === 'ar' ? "خطأ" : "Error", error.message);
      } else {
        Alert.alert(language === 'ar' ? "نجاح" : "Success", language === 'ar' ? "تم التحقق بنجاح" : "Verification successful");
        navigation.replace("MainTabs", { 
          loggedIn: true,
          admin: false // سيتم التحقق من الدور لاحقًا
        });
      }
    } catch (error) {
      Alert.alert(language === 'ar' ? "خطأ" : "Error", language === 'ar' ? "فشل في التحقق من الرمز" : "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Firebase Recaptcha removed - using direct authentication */}
      
      <View style={styles.form}>
        <Text style={styles.title}>{language === 'ar' ? "تسجيل الدخول برقم الهاتف" : "Phone Login"}</Text>
        
        {!showConfirmation ? (
          <>
            <Text style={styles.label}>{language === 'ar' ? "رقم الهاتف" : "Phone Number"}</Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ar' ? "أدخل رقم الهاتف مع رمز البلد" : "Enter phone number with country code"}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? (language === 'ar' ? "جاري الإرسال..." : "Sending...") : (language === 'ar' ? "إرسال رمز التحقق" : "Send Verification Code")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>{language === 'ar' ? "رمز التحقق" : "Verification Code"}</Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ar' ? "أدخل رمز التحقق" : "Enter verification code"}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? (language === 'ar' ? "جاري التحقق..." : "Verifying...") : (language === 'ar' ? "تحقق من الرمز" : "Verify Code")}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>{language === 'ar' ? "العودة" : "Back"}</Text>
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
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.button,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: "bold",
  },
});