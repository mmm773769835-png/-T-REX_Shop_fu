import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export default function AuthCallbackScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    // Debug logging
    console.log('[DEBUG] AuthCallbackScreen: user changed:', !!user, 'loading:', loading);

    // If loading is complete and we have a user, route to MainTabs
    if (!loading && user) {
      console.log('[DEBUG] AuthCallbackScreen: Authentication successful, routing to MainTabs');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { loggedIn: true, admin: false } }],
      });
      return;
    }

    // If loading is complete and we don't have a user, Auth failed
    if (!loading && !user) {
      console.log('[DEBUG] AuthCallbackScreen: Authentication failed, routing back to Login');
      Alert.alert(
        language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
        language === 'ar' 
          ? 'فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.' 
          : 'Google Sign-In failed. Please try again.'
      );
      navigation.replace('Login');
    }
  }, [user, loading, navigation, language]);

  // Fallback timeout in case loading state hangs or listener fails
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !user) {
        console.log('[DEBUG] AuthCallbackScreen: Authentication timeout, checking session one last time');
        // If still loading after 10 seconds, force redirect to Login
        Alert.alert(
          language === 'ar' ? 'انتهت مهلة الاتصال' : 'Connection Timeout',
          language === 'ar'
            ? 'استغرقت العملية وقتاً أطول من المعتاد. يرجى المحاولة مجدداً.'
            : 'The request took longer than expected. Please try again.'
        );
        navigation.replace('Login');
      }
    }, 12000); // 12 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [loading, user, navigation, language]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background || '#121212' }]}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#FFD700" style={styles.spinner} />
        <Text style={[styles.title, { color: colors.text || '#FFFFFF' }]}>
          {language === 'ar' ? 'جاري التحقق من الهوية...' : 'Verifying your identity...'}
        </Text>
        <Text style={styles.subtitle}>
          {language === 'ar' 
            ? 'يرجى الانتظار بينما نقوم بتهيئة حسابك بأمان' 
            : 'Please wait while we secure your account setup'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
