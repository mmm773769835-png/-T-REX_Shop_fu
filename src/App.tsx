import React from 'react';
import { ProductsProvider } from './contexts/ProductsContext';
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
          <ProductsProvider>
            <ThemeProvider>
              <LanguageProvider>
                <SafeAreaView style={{ flex: 1 }}>
                  <StatusBar barStyle="dark-content" />
                  <AppNavigator />
                </SafeAreaView>
              </LanguageProvider>
            </ThemeProvider>
          </ProductsProvider>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;