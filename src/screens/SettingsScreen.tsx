import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

const SettingsScreen = ({ navigation }: any) => {
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const { language, switchLanguage } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  
  const styles = getStyles(isDarkMode, colors);

  const handleEditProfile = () => {
    // التنقل إلى شاشة تعديل الملف الشخصي
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    // التنقل إلى شاشة تغيير كلمة المرور
    navigation.navigate('ChangePassword');
  };

  const handleLanguageChange = () => {
    // تغيير اللغة مباشرة بدون تأكيد
    console.log('🔄 SettingsScreen: الضغط على زر تبديل اللغة');
    switchLanguage();
  };

  const handleAboutApp = () => {
    // عرض معلومات حول التطبيق
    navigation.navigate('About');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'المظهر' : 'Appearance'}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={(value) => {
              console.log('🌙 SettingsScreen: الضغط على زر الوضع الليلي، القيمة:', value);
              toggleTheme();
            }}
            trackColor={{ false: "#767577", true: "#007bff" }}
            thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'إشعارات التطبيق' : 'App Notifications'}</Text>
          </View>
          <Switch 
            value={notifications} 
            onValueChange={setNotifications} 
            trackColor={{ false: "#767577", true: "#007bff" }}
            thumbColor={notifications ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'تنبيهات البريد الإلكتروني' : 'Email Alerts'}</Text>
          </View>
          <Switch 
            value={emailAlerts} 
            onValueChange={setEmailAlerts} 
            trackColor={{ false: "#767577", true: "#007bff" }}
            thumbColor={emailAlerts ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'الحساب' : 'Account'}</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingInfo}>
            <Ionicons name="person" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'عام' : 'General'}</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange} activeOpacity={0.7}>
          <View style={styles.settingInfo}>
            <Ionicons name="language" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'اللغة' : 'Language'}</Text>
          </View>
          <Text style={styles.settingValue}>{language === 'ar' ? 'العربية' : 'English'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleAboutApp}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle" size={24} color="#666" />
            <Text style={styles.settingText}>{language === 'ar' ? 'حول التطبيق' : 'About App'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.header,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  section: {
    marginTop: 20,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;
