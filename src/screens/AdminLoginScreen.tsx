import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Button from '../shared/components/Button';
import apiUrl from '../../config/api.config';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export default function AdminLoginScreen({ navigation }: any) {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    // التحقق من صحة المدخلات
    if (!email || !password) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      setLoading(false);
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email address"
      );
      setLoading(false);
      return;
    }

    try {
      // إرسال طلب المصادقة إلى السيرفر
      const response = await fetch(`${apiUrl}/api/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // تخزين الرمز بشكل آمن
        await SecureStore.setItemAsync('adminToken', data.token);
        // @ts-ignore
        navigation.navigate('AdminPanel');
      } else {
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          data.message || (language === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password")
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "حدث خطأ في الاتصال. يرجى المحاولة لاحقًا" : "Connection error. Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode, colors);

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <Text style={styles.title}>
          {language === "ar" ? "تسجيل دخول المدير" : "Admin Login"}
        </Text>

        <Text style={styles.label}>
          {language === "ar" ? "البريد الإلكتروني" : "Email"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل البريد الإلكتروني" : "Enter email"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
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
          placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter password"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading
              ? (language === "ar" ? "جاري تسجيل الدخول..." : "Logging in...")
              : (language === "ar" ? "تسجيل الدخول" : "Login")
            }
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#fff' : '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#fff' : '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
    color: isDarkMode ? '#fff' : '#333',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});