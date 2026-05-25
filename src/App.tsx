import React from 'react';
import { ProductsProvider } from './contexts/ProductsContext';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AdvancedFiltersProvider } from './contexts/AdvancedFiltersContext';
import { WishListProvider } from './contexts/WishListContext';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <CurrencyProvider>
          <WishListProvider>
            <ProductsProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <AdvancedFiltersProvider>
                    <SafeAreaView style={{ flex: 1 }}>
                      <StatusBar barStyle="dark-content" />
                      <AppNavigator />
                    </SafeAreaView>
                  </AdvancedFiltersProvider>
                </LanguageProvider>
              </ThemeProvider>
            </ProductsProvider>
          </WishListProvider>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;