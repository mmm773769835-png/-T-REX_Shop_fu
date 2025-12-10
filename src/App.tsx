import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import Navigator from './navigation/Navigator';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Navigator />
      </SafeAreaView>
    </AuthProvider>
  );
};

export default App;