import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './src/contexts/AuthContext';
// Initialize Firebase early to prevent "No Firebase App '[DEFAULT]' has been created" error
import './src/init/firebaseInit';

export default function App() {
  // #region agent log
  console.log('[DEBUG] App component started');
  // #endregion
  return (
    <AuthProvider>
      <CartProvider>
        <AppWithLoader />
      </CartProvider>
    </AuthProvider>
  );
}

const AppWithLoader = () => {
  // #region agent log
  console.log('[DEBUG] AppWithLoader component started');
  // #endregion
  const { loading, error } = useAuth();
  // #region agent log
  console.log('[DEBUG] useAuth result:', { loading, hasError: !!error, errorMessage: error?.message });
  // #endregion
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // #region agent log
    // #endregion
    // Check if environment variables are set
    const checkEnvironment = () => {
      // In a real app, you might want to check critical env vars here
      return true;
    };
    
    if (checkEnvironment()) {
      // Simulate app initialization delay
      const timer = setTimeout(() => {
        // #region agent log
        // #endregion
        setAppReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (loading || !appReady) {
    // #region agent log
    // #endregion
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>جاري تحميل التطبيق...</Text>
      </View>
    );
  }
  
  if (error) {
    // #region agent log
    // #endregion
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>حدث خطأ في تحميل التطبيق</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <Text style={styles.errorHint}>يرجى التحقق من ملف .env والإعدادات</Text>
      </View>
    );
  }
  
  // #region agent log
  // #endregion
  try {
    return <AppNavigator />;
  } catch (navError) {
    // #region agent log
    // #endregion
    throw navError;
  }
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