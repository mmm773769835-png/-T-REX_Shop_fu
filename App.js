import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { WishListProvider } from './src/contexts/WishListContext';
import { DealsProvider } from './src/contexts/DealsContext';
import { ReviewsProvider } from './src/contexts/ReviewsContext';
import { AdvancedFiltersProvider } from './src/contexts/AdvancedFiltersContext';
import { SearchProvider } from './src/contexts/SearchContext';
import { ProductsProvider } from './src/contexts/ProductsContext';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './src/contexts/AuthContext';
// Initialize Firebase early to prevent "No Firebase App '[DEFAULT]' has been created" error
// Firebase will be initialized in FirebaseAuthService.js only
// import './src/init/firebaseInit';
// Import AutoUpdateService for automatic updates
import AutoUpdateService from './src/services/AutoUpdateService';
// Import ErrorBoundary for error handling
import ErrorBoundary from './src/components/ErrorBoundary';
// Import ToastProvider for notifications
import ToastProvider from './src/services/ToastService';

export default function App() {
  // App component initialization
  console.log('[DEBUG] App component started');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <WishListProvider>
              <DealsProvider>
                <ReviewsProvider>
                  <AdvancedFiltersProvider>
                    <SearchProvider>
                      <ProductsProvider>
                        <ThemeProvider>
                          <LanguageProvider>
                            <ToastProvider>
                              <AppWithLoader />
                            </ToastProvider>
                          </LanguageProvider>
                        </ThemeProvider>
                      </ProductsProvider>
                    </SearchProvider>
                  </AdvancedFiltersProvider>
                </ReviewsProvider>
              </DealsProvider>
            </WishListProvider>
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const AppWithLoader = () => {
  // AppWithLoader component initialization
  console.log('[DEBUG] AppWithLoader component started');
  const { loading, error } = useAuth();
  // Log authentication state for debugging
  console.log('[DEBUG] useAuth result:', { loading, hasError: !!error, errorMessage: error?.message });
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Environment check
    // Check if environment variables are set
    const checkEnvironment = () => {
      // In a real app, you might want to check critical env vars here
      return true;
    };
    
    if (checkEnvironment()) {
      // AutoUpdateService disabled for web compatibility
      // AppState is not available on web platform
      // const autoUpdateService = AutoUpdateService.getInstance();
      // autoUpdateService.startAutoUpdateMonitoring();
      console.log('[DEBUG] AutoUpdateService disabled for web compatibility');
      
      // Simulate app initialization delay
      const timer = setTimeout(() => {
        // Set app ready state
        setAppReady(true);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        // Clean up AutoUpdateService when app unmounts
        // autoUpdateService.stopAutoUpdateMonitoring();
      };
    }
  }, []);
  
  if (loading || !appReady) {
    // Loading state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>جاري تحميل التطبيق...</Text>
      </View>
    );
  }
  
  if (error) {
    // Error state
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>حدث خطأ في تحميل التطبيق</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <Text style={styles.errorHint}>يرجى التحقق من ملف .env والإعدادات</Text>
      </View>
    );
  }
  
  // Render navigator
  try {
    return <AppNavigator />;
  } catch (navError) {
    // Handle navigation errors
    throw navError;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  errorHint: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});