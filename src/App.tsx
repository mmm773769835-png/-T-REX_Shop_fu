import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <CurrencyProvider>
          <ThemeProvider>
            <LanguageProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <AppNavigator />
              </SafeAreaView>
            </LanguageProvider>
          </ThemeProvider>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;