import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';

// Admin functionality moved to web dashboard
// URL: https://trexshopmax.com/admin.html
export default function AdminScreen({ navigation }: any) {
  const { isDarkMode, colors } = React.useContext(ThemeContext);
  
  const openWebAdmin = () => {
    Linking.openURL('https://trexshopmax.com/admin.html');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5' }]}>
      <View style={styles.content}>
        <Ionicons name="desktop-outline" size={80} color="#FFD700" />
        
        <Text style={[styles.title, { color: isDarkMode ? '#FFD700' : '#FF6600' }]}>
          لوحة التحكم متوفرة على الويب
        </Text>
        
        <Text style={[styles.description, { color: isDarkMode ? '#aaa' : '#666' }]}>
          إدارة المتجر متاحة الآن عبر لوحة تحكم متقدمة على الموقع الإلكتروني. {'\n\n'}
          يمكنك إضافة، تعديل، وحذف المنتجات بكل سهولة من خلال موقع trexshopmax.com
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={openWebAdmin}
        >
          <Text style={styles.buttonText}>فتح لوحة التحكم</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            العودة للمتجر
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 250,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#FFD700',
  },
});
