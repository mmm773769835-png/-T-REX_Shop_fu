import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService, dbService } from '../services/SupabaseService';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

const COUNTRIES = [
  { name: 'اليمن 🇾🇪', code: '+967' },
  { name: 'السعودية 🇸🇦', code: '+966' },
  { name: 'الإمارات 🇦🇪', code: '+971' },
  { name: 'الكويت 🇰🇼', code: '+965' },
  { name: 'البحرين 🇧🇭', code: '+973' },
  { name: 'عُمان 🇴🇲', code: '+968' },
  { name: 'قطر 🇶🇦', code: '+974' },
  { name: 'دولة أخرى', code: '+' },
];

export default function AdminLoginScreen({ navigation }: any) {
  const { isDarkMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  // Tab State: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Common / Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vendor Register State
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState(COUNTRIES[0].code + ' ');
  const [address, setAddress] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [countryDropdownVisible, setCountryDropdownVisible] = useState(false);

  // 🔑 تسجيل الدخول (Admin & Vendor Login)
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.signIn(email.trim(), password);

      if (error || !data.user) {
        Alert.alert(
          language === 'ar' ? 'خطأ في الدخول' : 'Login Error',
          error?.message || (language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
        );
        setLoading(false);
        return;
      }

      // جلب بيانات الحساب من جدول profiles
      const { data: profiles, error: profileErr } = await dbService.get('profiles', {
        eq: { id: data.user.id },
      });

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      // فحص الحسابات المحذوفة
      if (profile && (profile.role === 'deleted' || profile.vendor_code === 'DELETED')) {
        await authService.signOut();
        Alert.alert(
          language === 'ar' ? 'حساب محذوف' : 'Deleted Account',
          language === 'ar' ? '❌ هذا الحساب تم حذفه بشكل نهائي ولا يمكن تسجيل الدخول به.' : 'This account has been deleted.'
        );
        setLoading(false);
        return;
      }

      const role = profile?.role || 'vendor';
      const vendorCode = profile?.vendor_code || 'VND-XXXX';

      if (role === 'admin') {
        Alert.alert(
          language === 'ar' ? 'مرحباً بالمدير' : 'Welcome Admin',
          language === 'ar' ? '👑 أهلاً بك في لوحة تحكم مدير النظام' : 'Welcome to Super Admin Dashboard'
        );
      } else if (role === 'vendor') {
        Alert.alert(
          language === 'ar' ? 'مرحباً بالتاجر' : 'Welcome Vendor',
          language === 'ar' ? `🏪 مرحباً بك يا تاجر (${profile?.shop_name || 'متجرك'})\n🔑 كود التاجر: ${vendorCode}` : `Welcome vendor`
        );
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { loggedIn: true, admin: role === 'admin' || role === 'vendor' } }],
      });
    } catch (err: any) {
      console.error('Error during login:', err);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🚀 إنشاء حساب تاجر جديد (Vendor Registration)
  const handleVendorRegister = async () => {
    if (!name.trim() || !shopName.trim() || !phone.trim() || !address.trim() || !regEmail.trim() || !regPassword) {
      Alert.alert(
        language === 'ar' ? 'خطأ في المدخلات' : 'Input Error',
        language === 'ar' ? 'يرجى تعبئة كافة البيانات المطلوبة لإنشاء حساب المتجر' : 'Please fill all required vendor fields'
      );
      return;
    }

    if (regPassword.length < 6) {
      Alert.alert(
        language === 'ar' ? 'كلمة المرور قصيرة' : 'Weak Password',
        language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
      );
      return;
    }

    setLoading(true);
    try {
      // 1. إنشاء حساب في Supabase Auth
      const { data, error } = await authService.signUp(regEmail.trim(), regPassword);

      if (error || !data.user) {
        Alert.alert(
          language === 'ar' ? 'خطأ في التسجيل' : 'Registration Error',
          error?.message || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed')
        );
        setLoading(false);
        return;
      }

      // 2. توليد كود التاجر الفريد VND-XXXX
      const randomCode = `VND-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. حفظ بيانات التاجر في جدول profiles المباشر
      const profilePayload = {
        id: data.user.id,
        name: name.trim(),
        shop_name: shopName.trim(),
        country: selectedCountry.name,
        phone: phone.trim(),
        address: address.trim(),
        email: regEmail.trim(),
        role: 'vendor',
        vendor_code: randomCode,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await dbService.upsert('profiles', profilePayload);

      if (upsertErr) {
        console.error('Error upserting vendor profile:', upsertErr);
        await dbService.update('profiles', data.user.id, profilePayload);
      }

      Alert.alert(
        language === 'ar' ? 'تم إنشاء حساب المتجر 🎉' : 'Store Created 🎉',
        language === 'ar'
          ? `مرحباً بك كتاجر في منصة T-REX Shop!\n🏪 المتجر: ${shopName.trim()}\n🔑 كود التاجر الخاص بك: ${randomCode}`
          : `Vendor account created! Code: ${randomCode}`
      );

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { loggedIn: true, admin: true } }],
      });
    } catch (err: any) {
      console.error('Vendor Register error:', err);
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'حدث خطأ أثناء إنشاء حساب التاجر' : 'Error creating vendor account'
      );
    } finally {
      setLoading(false);
    }
  };

  // Google Auth
  const handleGoogleAuth = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (e) {
      console.log('Google Auth Error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Box */}
        <View style={styles.headerBox}>
          <Image
            source={require('../../logo.png')}
            style={styles.logoImage}
            defaultSource={{ uri: 'https://via.placeholder.com/100x100/1a1a1a/FFD700?text=T-REX' }}
          />
          <Text style={styles.headerTitle}>
            {language === 'ar' ? '🏪 لوحة التجار والمدراء' : '🏪 Vendor & Admin Portal'}
          </Text>
          <Text style={styles.headerSub}>
            {language === 'ar' ? 'دخول التجار وإدارة المنتجات | T-REX Shop' : 'Vendor Sign In & Management'}
          </Text>
        </View>

        {/* Auth Mode Tabs */}
        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, activeTab === 'login' && styles.activeAuthTab]}
            onPress={() => setActiveTab('login')}
          >
            <Ionicons name="key-outline" size={16} color={activeTab === 'login' ? '#1a1a1a' : '#FFD700'} />
            <Text style={[styles.authTabText, activeTab === 'login' && styles.activeAuthTabText]}>
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authTab, activeTab === 'register' && styles.activeAuthTab]}
            onPress={() => setActiveTab('register')}
          >
            <Ionicons name="storefront-outline" size={16} color={activeTab === 'register' ? '#1a1a1a' : '#FFD700'} />
            <Text style={[styles.authTabText, activeTab === 'register' && styles.activeAuthTabText]}>
              {language === 'ar' ? 'حساب تاجر جديد' : 'New Vendor'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <View style={styles.card}>
            {/* Google Sign In */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth}>
              <Text style={styles.googleIconText}>G</Text>
              <Text style={styles.googleBtnText}>
                {language === 'ar' ? 'الدخول السريع بحساب Google' : 'Fast Sign in with Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{language === 'ar' ? 'أو بالبريد الإلكتروني' : 'Or with Email'}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Text>
            <TextInput
              style={styles.input}
              placeholder="vendor@example.com"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{language === 'ar' ? 'كلمة المرور' : 'Password'}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#1a1a1a" />
              ) : (
                <Text style={styles.submitBtnText}>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchLink} onPress={() => setActiveTab('register')}>
              <Text style={styles.switchLinkText}>
                {language === 'ar' ? 'ليس لديك حساب تاجر؟ ' : "Don't have a vendor account? "}
                <Text style={styles.goldText}>{language === 'ar' ? 'إنشاء حساب تاجر جديد 🚀' : 'Create Vendor 🚀'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab 2: Vendor Register Form */}
        {activeTab === 'register' && (
          <View style={styles.card}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'اسم التاجر / الاسم الكامل *' : 'Full Name *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>
              <Ionicons name="storefront-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'اسم المتجر الخاص بك *' : 'Store Name *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ar' ? 'مثال: متجر الهواتف المميزة' : 'e.g. Premium Tech Store'}
              placeholderTextColor="#777"
              value={shopName}
              onChangeText={setShopName}
            />

            <Text style={styles.label}>
              <Ionicons name="globe-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'الدولة *' : 'Country *'}
            </Text>
            <TouchableOpacity
              style={styles.countryPickerBtn}
              onPress={() => setCountryDropdownVisible(!countryDropdownVisible)}
            >
              <Text style={styles.countryPickerText}>{selectedCountry.name}</Text>
              <Ionicons name="chevron-down" size={18} color="#FFD700" />
            </TouchableOpacity>

            {countryDropdownVisible && (
              <View style={styles.countryDropdown}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c.name}
                    style={styles.countryOption}
                    onPress={() => {
                      setSelectedCountry(c);
                      setPhone(c.code + ' ');
                      setCountryDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.countryOptionText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>
              <Ionicons name="call-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'رقم الهاتف / الواتساب (مع رمز الدولة) *' : 'Phone / WhatsApp *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="+967 771234567"
              placeholderTextColor="#777"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>
              <Ionicons name="location-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'عنوان التاجر / المحل *' : 'Store Address *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'ar' ? 'المدينة، الشارع، التفاصيل' : 'City, Street, Details'}
              placeholderTextColor="#777"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>
              <Ionicons name="mail-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="vendor@example.com"
              placeholderTextColor="#777"
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              <Ionicons name="lock-closed-outline" size={14} color="#FFD700" /> {language === 'ar' ? 'كلمة المرور *' : 'Password *'}
            </Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#777"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry={!showRegPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowRegPassword(!showRegPassword)}>
                <Ionicons name={showRegPassword ? 'eye-off' : 'eye'} size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#FF6B35', marginTop: 16 }]}
              onPress={handleVendorRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitBtnText, { color: '#fff' }]}>
                  {language === 'ar' ? '🚀 إنشاء حساب المتجر والدخول' : 'Create Store & Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchLink} onPress={() => setActiveTab('login')}>
              <Text style={styles.switchLinkText}>
                {language === 'ar' ? 'أمتلك حساب تاجر بالفعل؟ ' : 'Already have a vendor account? '}
                <Text style={styles.goldText}>{language === 'ar' ? 'تسجيل الدخول 🔑' : 'Sign In 🔑'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
    maxWidth: 420,
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeAuthTab: {
    backgroundColor: '#FFD700',
  },
  authTabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#aaa',
  },
  activeAuthTabText: {
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    borderColor: '#FFD70040',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ddd',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  submitBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#1a1a1a',
    fontWeight: '900',
    fontSize: 15,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 11,
    marginBottom: 14,
    gap: 8,
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  googleBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#888',
    fontSize: 11,
    marginHorizontal: 10,
  },
  switchLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchLinkText: {
    color: '#aaa',
    fontSize: 13,
  },
  goldText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  countryPickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  countryPickerText: {
    color: '#fff',
    fontSize: 14,
  },
  countryDropdown: {
    backgroundColor: '#202020',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
    overflow: 'hidden',
  },
  countryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  countryOptionText: {
    color: '#fff',
    fontSize: 14,
  },
});