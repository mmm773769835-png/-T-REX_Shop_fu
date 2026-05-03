import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// تعريف نوع السياق
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof darkColors | typeof lightColors;
}

// تعريف الألوان للوضع الليلي الغامق
const darkColors = {
  primary: '#FFD700', // لون ذهبي للإشعارات والعناصر المهمة
  secondary: '#FFA500', // لون برتقالي ذهبي
  background: '#0A0A0A', // أسود غامق جداً
  surface: '#1A1A1A', // أسود غامق للبطاقات
  card: '#252525', // أسود للبطاقات الصغيرة
  text: '#FFFFFF', // نصوص بيضاء
  textSecondary: '#B0B0B0', // نصوص ثانوية رمادية
  border: '#333333', // حدود رمادية داكنة
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD93D',
  tabBar: '#1A1A1A',
  tabBarActive: '#FFD700',
  tabBarInactive: '#666666',
  header: '#1A1A1A',
  button: '#FFD700',
  buttonText: '#000000',
  placeholder: '#666666',
  inputBackground: '#252525',
  inputBorder: '#444444',
  shadow: 'rgba(0, 0, 0, 0.5)',
  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDark: '#CCAC00',
};

// تعريف الألوان للوضع الفاتح
const lightColors = {
  primary: '#FFD700', // لون ذهبي للإشعارات والعناصر المهمة
  secondary: '#FFA500',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD93D',
  tabBar: '#FFFFFF',
  tabBarActive: '#FFD700',
  tabBarInactive: '#999999',
  header: '#FFFFFF',
  button: '#FFD700',
  buttonText: '#000000',
  placeholder: '#999999',
  inputBackground: '#FFFFFF',
  inputBorder: '#DDDDDD',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDark: '#CCAC00',
};

// إنشاء السياق - الوضع الليلي هو الافتراضي
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  colors: darkColors,
  toggleTheme: () => {},
});

// مزود السياق
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // ✅ البدء بالوضع الليلي
  const [isLoading, setIsLoading] = useState(true);

  // تحميل تفضيل السمة من التخزين المحلي
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(true); // ✅ إذا لم يكن هناك تفضيل محفوظ، استخدم الوضع الليلي
        }
        setIsLoading(false);
      } catch (error) {
        console.error('❌ فشل في تحميل تفضيل السمة:', error);
        setIsDarkMode(true); // ✅ في حالة الخطأ، استخدم الوضع الليلي
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // حفظ تفضيل السمة في التخزين المحلي
  const toggleTheme = useCallback(() => {
    console.log('🌙 ThemeContext: toggleTheme تم استدعاؤها');
    setIsDarkMode((prevMode) => {
      const newTheme = !prevMode;
      console.log('🌙 ThemeContext: تبديل الوضع الليلي:', prevMode, '->', newTheme);
      
      // حفظ في AsyncStorage بشكل غير متزامن
      AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light')
        .then(() => {
          console.log('✅ ThemeContext: تم حفظ تفضيل السمة:', newTheme ? 'dark' : 'light');
        })
        .catch((error) => {
          console.error('❌ ThemeContext: فشل في حفظ تفضيل السمة:', error);
        });
      
      return newTheme;
    });
  }, []);

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};