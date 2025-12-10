import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeV2 from '../screens/HomeV2';
import AddProduct from '../screens/AddProduct';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import ProductDetails from '../screens/ProductDetails';

// إنشاء مكدس التنقل
const Stack = createStackNavigator();

// تكوين التنقل الرئيسي
export default function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007bff',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{
            title: 'تسجيل الدخول',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="PhoneLogin" 
          component={PhoneLoginScreen} 
          options={{
            title: 'تسجيل الدخول عبر الهاتف',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{
            title: 'إنشاء حساب',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeV2} 
          options={{
            title: '🏪 متجر T-REX',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProduct} 
          options={{
            title: 'إضافة منتج جديد',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="ProductDetails" 
          component={ProductDetails} 
          options={{
            title: 'تفاصيل المنتج',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}