import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppWithLoader />
      </CartProvider>
    </AuthProvider>
  );
}

const AppWithLoader = () => {
  const { loading, error } = useAuth();
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Check if environment variables are set
    const checkEnvironment = () => {
      // In a real app, you might want to check critical env vars here
      return true;
    };
    
    if (checkEnvironment()) {
      // Simulate app initialization delay
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (loading || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>جاري تحميل التطبيق...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>حدث خطأ في تحميل التطبيق</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <Text style={styles.errorHint}>يرجى التحقق من ملف .env والإعدادات</Text>
      </View>
    );
  }
  
  return <AppNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});