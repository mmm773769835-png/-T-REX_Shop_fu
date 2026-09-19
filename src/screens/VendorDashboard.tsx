import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbService } from '../services/SupabaseService';
import { useAuth } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { getDefaultProductImage } from '../utils/imageUtils';

export default function VendorDashboard({ navigation, route }: any) {
  const { user } = useAuth();
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorCode, setVendorCode] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [featuredUntil, setFeaturedUntil] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('vendor');

  // Digital countdown state (days, hours, minutes, seconds)
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Activation code input state
  const [redeemInput, setRedeemInput] = useState<string>('');
  const [redeeming, setRedeeming] = useState<boolean>(false);

  // Admin Code Generator state
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [generatingCode, setGeneratingCode] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const ADMIN_EMAILS = ['mmm773769835@gmail.com', 'trexshopmax@gmail.com', 'mmm712874799@gmail.com'];
  const isAdminEmail = (email?: string) => !!(email && ADMIN_EMAILS.includes(email.trim().toLowerCase()));

  const currentUserId = user?.id || user?.uid;
  const currentUserEmail = (user?.email || '').toLowerCase();
  const targetVendorId = route?.params?.vendorId || currentUserId;
  const targetVendorName = route?.params?.vendorName || '';

  const fetchVendorProducts = async () => {
    if (!targetVendorId) {
      setLoading(false);
      return;
    }

    try {
      // 1. جلب بيانات التاجر (vendor_code و shop_name و featured_until و role)
      const { data: profileData } = await dbService.get('profiles', { eq: { id: targetVendorId } });
      if (profileData && profileData.length > 0) {
        const prof = profileData[0];
        setVendorCode(prof.vendor_code || 'VND-NEW');
        setShopName(prof.shop_name || targetVendorName || prof.name || 'متجري');
        setFeaturedUntil(prof.featured_until || null);

        const isAdmin = prof.role === 'admin' || prof.role === 'superadmin' || isAdminEmail(currentUserEmail);
        setUserRole(isAdmin ? 'admin' : (prof.role || 'vendor'));
      } else {
        if (targetVendorName) setShopName(targetVendorName);
        const isAdmin = isAdminEmail(currentUserEmail);
        setUserRole(isAdmin ? 'admin' : 'vendor');
      }

      // 2. جلب المنتجات التي يملكها هذا التاجر فقط
      const { data: prodData, error } = await dbService.get('products', { eq: { vendor_id: targetVendorId } });
      if (error) {
        console.error('Error fetching vendor products:', error);
      } else {
        setProducts(prodData || []);
      }
    } catch (err) {
      console.error('VendorDashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendorProducts();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchVendorProducts();
    });
    return unsubscribe;
  }, [navigation, user, targetVendorId]);

  useEffect(() => {
    if (!featuredUntil) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(featuredUntil).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [featuredUntil]);

  // تفعيل كود الاشتراك التراكمي
  const handleRedeemCode = async () => {
    const codeStr = redeemInput.trim().toUpperCase();
    if (!codeStr) {
      Alert.alert(
        language === 'ar' ? 'تنبيه' : 'Warning',
        language === 'ar' ? 'يرجى إدخال كود التفعيل' : 'Please enter activation code'
      );
      return;
    }

    setRedeeming(true);
    try {
      const { data, error } = await dbService.get('activation_codes', { eq: { code: codeStr, status: 'active' } });
      if (error || !data || data.length === 0) {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' ? 'كود التفعيل غير صحيح أو تم استخدامه سابقاً' : 'Invalid or used code'
        );
        setRedeeming(false);
        return;
      }

      const codeItem = data[0];
      const durationDays = codeItem.duration_days || 30;
      const now = new Date();

      let baseTime = now.getTime();
      if (featuredUntil && new Date(featuredUntil) > now) {
        baseTime = new Date(featuredUntil).getTime();
      }

      const expiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

      // Update activation code
      await dbService.update('activation_codes', codeItem.id, {
        status: 'used',
        used_by_vendor_id: targetVendorId,
        activated_at: now.toISOString(),
        expires_at: expiresAt,
      });

      // Update vendor profile
      await dbService.update('profiles', targetVendorId, { featured_until: expiresAt });

      setFeaturedUntil(expiresAt);
      setRedeemInput('');
      Alert.alert(
        language === 'ar' ? 'تم التفعيل / التجديد بنجاح! 🎉' : 'Activated / Renewed! 🎉',
        language === 'ar'
          ? `تم تفعيل/تجديد اشتراك المميز والبنر لـ ${durationDays} يوماً إضافية!\nينتهي بتاريخ: ${new Date(expiresAt).toLocaleDateString('ar-EG')}`
          : `Featured subscription renewed for ${durationDays} additional days!`
      );
    } catch (err: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', err.message || 'فشل التفعيل');
    } finally {
      setRedeeming(false);
    }
  };

  // توليد كود تفعيل جديد للمدير
  const handleAdminGenerateCode = async () => {
    const prefix = `TRX-${selectedDuration}D-`;
    const randomCode = prefix + Math.floor(100000 + Math.random() * 900000);
    setGeneratingCode(true);

    try {
      const { error } = await dbService.add('activation_codes', {
        code: randomCode,
        duration_days: selectedDuration,
        status: 'active',
      });

      if (error) {
        Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message || 'فشل توليد الكود');
      } else {
        setGeneratedCode(randomCode);
        Alert.alert(
          language === 'ar' ? 'تم توليد كود التفعيل بنجاح! 🔑' : 'Code Generated! 🔑',
          language === 'ar'
            ? `كود التفعيل: ${randomCode}\nالمدة: ${selectedDuration} يوماً\nيمكنك نسخه وإرساله للتاجر.`
            : `Code: ${randomCode}\nDuration: ${selectedDuration} days`
        );
      }
    } catch (err: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', err.message || 'فشل توليد الكود');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' ? `هل أنت متأكد من حذف المنتج: "${productName}"؟` : `Are you sure you want to delete "${productName}"?`,
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await dbService.delete('products', productId);
            if (error) {
              Alert.alert(
                language === 'ar' ? 'خطأ' : 'Error',
                language === 'ar' ? 'فشل في حذف المنتج' : 'Failed to delete product'
              );
            } else {
              Alert.alert(
                language === 'ar' ? 'تم الحذف' : 'Deleted',
                language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully'
              );
              fetchVendorProducts();
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const imageUrl = item.image_url || (item.images && item.images.length > 0 ? item.images[0] : item.primaryImage) || getDefaultProductImage();
    const isUsed = item.condition === 'used';

    return (
      <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />

        <View style={styles.productDetails}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {isUsed && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedBadgeText}>{language === 'ar' ? 'مستعمل' : 'Used'}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.vendorPriceText, { color: colors.textSecondary }]}>
            {language === 'ar' ? `سعرك الصافي: ${item.vendor_price || item.price} د.ل` : `Net Price: ${item.vendor_price || item.price}`}
          </Text>

          <Text style={[styles.customerPriceText, { color: '#28a745' }]}>
            {language === 'ar' ? `السعر المعروض (+10%): ${item.price} د.ل` : `Customer Price (+10%): ${item.price}`}
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FFD700' }]}
              onPress={() => navigation.navigate('AddProduct', { editProduct: item })}
            >
              <Ionicons name="create-outline" size={16} color="#1a1a1a" />
              <Text style={styles.actionBtnText}>{language === 'ar' ? 'تعديل' : 'Edit'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#ff4d4d' }]}
              onPress={() => handleDeleteProduct(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>{language === 'ar' ? 'حذف' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHeaderComponent = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
      {/* Admin Status & Code Generator Panel */}
      {userRole === 'admin' ? (
        <View style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', borderColor: '#25D366', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>
            👑 {language === 'ar' ? 'حساب مسؤول المنصة: يمكنك تمييز أي منتج وإنشاء أكواد التفعيل للتجار بدون حدود.' : 'Platform Admin Account: Full featured access & unlimited code generation.'}
          </Text>

          {/* Admin Code Generator Box */}
          <View style={{ marginTop: 12, backgroundColor: '#181818', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#333' }}>
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>
              🔑 {language === 'ar' ? 'مولّد أكواد التفعيل للتجار (خاص بالمدير):' : 'Vendor Code Generator (Admin):'}
            </Text>

            {/* Duration Pills */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              {[
                { label: '7 أيام', days: 7 },
                { label: '30 يوماً', days: 30 },
                { label: '60 يوماً', days: 60 },
                { label: '90 يوماً', days: 90 },
                { label: 'سنة', days: 365 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.days}
                  onPress={() => setSelectedDuration(item.days)}
                  style={{
                    backgroundColor: selectedDuration === item.days ? '#FFD700' : '#262626',
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selectedDuration === item.days ? '#FFD700' : '#444',
                  }}
                >
                  <Text style={{ color: selectedDuration === item.days ? '#000' : '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAdminGenerateCode}
              disabled={generatingCode}
              style={{ backgroundColor: '#28a745', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
            >
              {generatingCode ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                  ⚡ {language === 'ar' ? `توليد كود تفعيل لمدة (${selectedDuration} يوماً)` : `Generate Code (${selectedDuration} Days)`}
                </Text>
              )}
            </TouchableOpacity>

            {generatedCode ? (
              <View style={{ marginTop: 10, backgroundColor: '#000', borderWidth: 1, borderColor: '#FFD700', borderRadius: 8, padding: 10, alignItems: 'center' }}>
                <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 4 }}>
                  {language === 'ar' ? 'كود التفعيل الجديد:' : 'New Activation Code:'}
                </Text>
                <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, fontFamily: 'monospace', letterSpacing: 1 }}>
                  {generatedCode}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(language === 'ar' ? 'تم النسخ' : 'Copied', `كود التفعيل: ${generatedCode}`);
                  }}
                  style={{ marginTop: 6, backgroundColor: '#FFD700', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 }}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 11 }}>
                    📋 {language === 'ar' ? 'نسخ الكود' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Active Subscription: Digital Stopwatch Widget (4 Boxes) */}
      {countdown ? (
        <View style={{ backgroundColor: 'rgba(255, 215, 0, 0.08)', borderColor: '#FFD700', borderWidth: 1.5, borderRadius: 14, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Ionicons name="timer-outline" size={18} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13 }}>
              {language === 'ar' ? 'العداد التنازلي المباشر لانتهاء اشتراك التمييز والبنر:' : 'Live Featured Subscription Countdown:'}
            </Text>
          </View>

          {/* 4 Digital Stopwatch Boxes */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            {/* Days Box */}
            <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#FFD700', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', minWidth: 55 }}>
              <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
                {countdown.days}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 10, marginTop: 2 }}>
                {language === 'ar' ? 'أيام' : 'Days'}
              </Text>
            </View>

            <Text style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginHorizontal: 4 }}>:</Text>

            {/* Hours Box */}
            <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#FFD700', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', minWidth: 55 }}>
              <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
                {String(countdown.hours).padStart(2, '0')}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 10, marginTop: 2 }}>
                {language === 'ar' ? 'ساعات' : 'Hours'}
              </Text>
            </View>

            <Text style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginHorizontal: 4 }}>:</Text>

            {/* Minutes Box */}
            <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#FFD700', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', minWidth: 55 }}>
              <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
                {String(countdown.minutes).padStart(2, '0')}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 10, marginTop: 2 }}>
                {language === 'ar' ? 'دقائق' : 'Mins'}
              </Text>
            </View>

            <Text style={{ color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginHorizontal: 4 }}>:</Text>

            {/* Seconds Box */}
            <View style={{ backgroundColor: '#111', borderWidth: 1, borderColor: '#FFD700', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', minWidth: 55 }}>
              <Text style={{ color: '#FFD700', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
                {String(countdown.seconds).padStart(2, '0')}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 10, marginTop: 2 }}>
                {language === 'ar' ? 'ثواني' : 'Secs'}
              </Text>
            </View>
          </View>
        </View>
      ) : userRole !== 'admin' ? (
        <View style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: '#ff4444', borderWidth: 1, borderRadius: 12, padding: 14 }}>
          <Text style={{ color: '#ff4444', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
            ⚠️ {language === 'ar' ? 'انتهى اشتراك التمييز والبنر 🔴' : 'Featured Subscription Expired 🔴'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
            {language === 'ar' ? 'نزلت منتجاتك من خانة المميز والبنر تلقائياً. أدخل كود تفعيل جديد للتجديد الفوري.' : 'Your products were removed from featured list. Enter activation code to extend.'}
          </Text>
        </View>
      ) : null}

      {/* Code Activation Input Card (for vendors) */}
      <View style={{ marginTop: 12, marginBottom: 8, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>
          🔑 {language === 'ar' ? 'إدخال كود تفعيل التمييز والبنر:' : 'Enter Activation Code:'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: colors.text,
              fontSize: 13,
            }}
            placeholder="TRX-30D-XXXXXX"
            placeholderTextColor="#888"
            value={redeemInput}
            onChangeText={setRedeemInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={handleRedeemCode}
            disabled={redeeming}
            style={{ backgroundColor: '#28a745', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' }}
          >
            {redeeming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                🚀 {language === 'ar' ? 'تفعيل' : 'Redeem'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {language === 'ar' ? 'لوحة منتجات التاجر' : 'Vendor Dashboard'}
          </Text>
          {vendorCode ? (
            <Text style={{ fontSize: 12, color: '#28a745', fontWeight: 'bold' }}>
              🏬 {shopName} | الكود: {vendorCode}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main List with Header Component */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ marginTop: 10, color: colors.text }}>
            {language === 'ar' ? 'جاري تحميل منتجاتك...' : 'Loading your products...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListHeaderComponent={renderHeaderComponent}
          ListEmptyComponent={
            <View style={[styles.centerContainer, { paddingVertical: 40 }]}>
              <Ionicons name="cube-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {language === 'ar' ? 'لا توجد منتجات خاصة بك بعد' : 'No products found'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {language === 'ar' ? 'اضغط على زر (+) بالأعلى لإضافة منتجك الأول' : 'Tap (+) above to add your first product'}
              </Text>
              <TouchableOpacity
                style={styles.firstAddBtn}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
                </Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchVendorProducts();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: '#28a745',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 5 },
  firstAddBtn: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  productImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  productDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  vendorPriceText: { fontSize: 13, marginTop: 2 },
  customerPriceText: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1a1a1a' },
  usedBadge: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  usedBadgeText: { color: '#ff9800', fontSize: 10, fontWeight: 'bold' },
});
