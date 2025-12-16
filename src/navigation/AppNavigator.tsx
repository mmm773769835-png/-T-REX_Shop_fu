import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import HomeV2 from '../screens/HomeV2';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetails';
import LoginScreen from '../screens/OtpLoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CheckoutScreen from '../screens/OrderConfirm';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name='Home' component={HomeV2} options={{ headerShown: false }} />
      <Tab.Screen name='Categories' component={HomeV2} options={{ headerShown: false }} />
      <Tab.Screen name='Search' component={HomeV2} options={{ headerShown: false }} />
      <Tab.Screen name='Cart' component={CartScreen} options={{ headerShown: false }} />
      <Tab.Screen name='Profile' component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Main stack navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='MainTabs' component={MainTabs} />
        <Stack.Screen name='ProductDetails' component={ProductDetailsScreen} />
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Register' component={RegisterScreen} />
        <Stack.Screen name='OrderHistory' component={OrderHistoryScreen} />
        <Stack.Screen name='Checkout' component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
