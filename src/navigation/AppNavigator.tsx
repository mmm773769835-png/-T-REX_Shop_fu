import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

// Import screens normally (without lazy loading for web compatibility)
import HomeV2 from '../screens/HomeV2';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetails';
import LoginScreen from '../screens/LoginScreen';
import OtpLoginScreen from '../screens/OtpLoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CheckoutScreen from '../screens/OrderConfirm';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminScreen from '../screens/AdminScreen';
import AddProduct from '../screens/AddProduct';
import AddressesScreen from '../screens/AddressesScreen';
import WishlistScreen from '../screens/WishListScreen';
import DealsScreen from '../screens/DealsScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import FiltersScreen from '../screens/FiltersScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfile from '../screens/EditProfile';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AboutScreen from '../screens/AboutScreen';
// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
const MainTabs = () => {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  // translate tab names
  const getTabLabel = (routeName: string) => {
    if (language === 'ar') {
      switch (routeName) {
        case 'Home':
          return 'الرئيسية';
        case 'Categories':
          return 'الأقسام';
        case 'Search':
          return 'البحث';
        case 'Cart':
          return 'السلة';
        case 'Profile':
          return 'حسابي';
        default:
          return routeName;
      }
    }
    switch (routeName) {
      case 'Home':
        return 'Home';
      case 'Categories':
        return 'Categories';
      case 'Search':
        return 'Search';
      case 'Cart':
        return 'Cart';
      case 'Profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <Tab.Navigator
      key={language} // recreate Navigator when language changes
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconSize = 25; // Icon size

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse'; // fallback
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#C5A028', // Muted gold color for active icons and labels
        tabBarInactiveTintColor: '#FFFFFF', // White color for inactive icons and labels
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // Dark gray background (not pure black)
          borderTopColor: '#333333', // Dark border
          height: 110,
          paddingBottom: insets.bottom + 15,
          paddingTop: 15,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name='Home' 
        component={HomeV2} 
        options={{ 
          headerShown: false,
          tabBarLabel: language === 'ar' ? 'الرئيسية' : 'Home'
        }} 
      />
      <Tab.Screen 
        name='Categories' 
        component={HomeV2} 
        options={{ 
          headerShown: false,
          tabBarLabel: language === 'ar' ? 'الأقسام' : 'Categories'
        }} 
      />
      <Tab.Screen 
        name='Search' 
        component={HomeV2} 
        options={{ 
          headerShown: false,
          tabBarLabel: language === 'ar' ? 'البحث' : 'Search'
        }} 
      />
      <Tab.Screen 
        name='Cart' 
        component={CartScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: language === 'ar' ? 'السلة' : 'Cart'
        }} 
      />
      <Tab.Screen 
        name='Profile' 
        component={ProfileScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: language === 'ar' ? 'حسابي' : 'Profile'
        }} 
      />
    </Tab.Navigator>
  );
};

// Main stack navigator
const AppNavigator = () => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  // دالة لترجمة العناوين
  const getHeaderTitle = (routeName: string, defaultTitle: string) => {
    const titles: { [key: string]: { ar: string; en: string } } = {
      Login: { ar: 'تسجيل الدخول', en: 'Login' },
      PhoneLogin: { ar: 'تسجيل الدخول عبر الهاتف', en: 'Phone Login' },
      Register: { ar: 'إنشاء حساب', en: 'Register' },
      MainTabs: { ar: '🏪 متجر T-REX', en: '🏪 T-REX Store' },
      ProductDetails: { ar: 'تفاصيل المنتج', en: 'Product Details' },
      OrderConfirm: { ar: 'تأكيد الطلب', en: 'Order Confirmation' },
      AdminLogin: { ar: 'تسجيل دخول المدير', en: 'Admin Login' },
      AdminPanel: { ar: 'لوحة تحكم المدير', en: 'Admin Panel' },
      AddProduct: { ar: 'إضافة منتج جديد', en: 'Add New Product' },
      Addresses: { ar: 'عناويني', en: 'My Addresses' },
      WishList: { ar: 'قائمة الأمنيات', en: 'Wishlist' },
      Deals: { ar: 'عروض يومية', en: 'Daily Deals' },
      Reviews: { ar: 'المراجعات', en: 'Reviews' },
      Filters: { ar: 'الفلاتر', en: 'Filters' },
      Search: { ar: 'البحث', en: 'Search' },
      Settings: { ar: 'الإعدادات', en: 'Settings' },
      EditProfile: { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
      ChangePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
      About: { ar: 'حول التطبيق', en: 'About App' },
    };
    
    return titles[routeName]?.[language === 'ar' ? 'ar' : 'en'] || defaultTitle;
  };

  // إعدادات Deep Linking
  const linking = {
    prefixes: ['trexshop://', 'https://trex-shop.com'],
    config: {
      screens: {
        MainTabs: 'home',
        ProductDetails: 'product/:productId',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={() => ({
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: colors.text,
          },
        })}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={() => ({
            title: getHeaderTitle('Login', 'Login'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="PhoneLogin" 
          component={PhoneLoginScreen} 
          options={() => ({
            title: getHeaderTitle('PhoneLogin', 'Phone Login'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={() => ({
            title: getHeaderTitle('Register', 'Register'),
            headerShown: true,
          })}
        />
        <Stack.Screen name='MainTabs' component={MainTabs} 
          options={() => ({
            title: getHeaderTitle('MainTabs', '🏪 T-REX Store'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name='ProductDetails' 
          component={ProductDetailsScreen} 
          options={() => ({
            title: getHeaderTitle('ProductDetails', 'Product Details'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name='OrderHistory' 
          component={OrderHistoryScreen} 
        />
        <Stack.Screen 
          name='OrderConfirm' 
          component={CheckoutScreen} 
          options={() => ({
            title: getHeaderTitle('OrderConfirm', 'Order Confirmation'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name='Checkout' 
          component={CheckoutScreen} 
        />
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen} 
          options={() => ({
            title: getHeaderTitle('AdminLogin', 'Admin Login'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="AdminPanel" 
          component={AdminScreen} 
          options={() => ({
            title: getHeaderTitle('AdminPanel', 'Admin Panel'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProduct} 
          options={() => ({
            title: getHeaderTitle('AddProduct', 'Add New Product'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Addresses" 
          component={AddressesScreen} 
          options={() => ({
            title: getHeaderTitle('Addresses', 'My Addresses'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="WishList" 
          component={WishlistScreen} 
          options={() => ({
            title: getHeaderTitle('WishList', 'Wishlist'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Deals" 
          component={DealsScreen} 
          options={() => ({
            title: getHeaderTitle('Deals', 'Daily Deals'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Reviews" 
          component={ReviewsScreen} 
          options={() => ({
            title: getHeaderTitle('Reviews', 'Reviews'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Filters" 
          component={FiltersScreen} 
          options={() => ({
            title: getHeaderTitle('Filters', 'Filters'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={() => ({
            title: getHeaderTitle('Search', 'Search'),
            headerShown: false,
          })}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={() => ({
            title: getHeaderTitle('Settings', 'Settings'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfile} 
          options={() => ({
            title: getHeaderTitle('EditProfile', 'Edit Profile'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={() => ({
            title: getHeaderTitle('ChangePassword', 'Change Password'),
            headerShown: true,
          })}
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen} 
          options={() => ({
            title: getHeaderTitle('About', 'About App'),
            headerShown: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
