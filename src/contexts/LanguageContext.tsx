import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// تعريف نوع السياق
interface LanguageContextType {
  language: 'ar' | 'en';
  switchLanguage: () => void;
}

// إنشاء السياق
export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  switchLanguage: () => {},
});

// مزود السياق
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isLoading, setIsLoading] = useState(true);

  // تحميل تفضيل اللغة من التخزين المحلي
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('languagePreference');
        if (savedLanguage === 'en' || savedLanguage === 'ar') {
          setLanguage(savedLanguage);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('❌ فشل في تحميل تفضيل اللغة:', error);
        setIsLoading(false);
      }
    };

    loadLanguagePreference();
  }, []);

  // حفظ تفضيل اللغة في التخزين المحلي
  const switchLanguage = useCallback(() => {
    console.log('🔄 LanguageContext: switchLanguage تم استدعاؤها');
    setLanguage((prevLanguage) => {
      const newLanguage = prevLanguage === 'ar' ? 'en' : 'ar';
      console.log('🔄 LanguageContext: تبديل اللغة:', prevLanguage, '->', newLanguage);
      
      // حفظ في AsyncStorage بشكل غير متزامن
      AsyncStorage.setItem('languagePreference', newLanguage)
        .then(() => {
          console.log('✅ LanguageContext: تم حفظ تفضيل اللغة:', newLanguage);
        })
        .catch((error) => {
          console.error('❌ LanguageContext: فشل في حفظ تفضيل اللغة:', error);
        });
      
      // هنا يمكنك إضافة منطق لتغيير اتجاه النص والخطوط حسب اللغة
      // لكن هذا يتطلب تعديلات إضافية في المكونات
      
      return newLanguage;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};