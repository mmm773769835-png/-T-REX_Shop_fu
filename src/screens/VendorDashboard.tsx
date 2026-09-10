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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbService } from '../services/SupabaseService';
import { useAuth } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { getDefaultProductImage } from '../utils/imageUtils';

export default function VendorDashboard({ navigation }: any) {
  const { user } = useAuth();
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorCode, setVendorCode] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');

  const fetchVendorProducts = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      // 1. جلب بيانات التاجر (vendor_code و shop_name)
      const { data: profileData } = await dbService.get('profiles', { eq: { id: user.uid } });
      if (profileData && profileData.length > 0) {
        setVendorCode(profileData[0].vendor_code || 'VND-NEW');
        setShopName(profileData[0].shop_name || 'متجري');
      }

      // 2. جلب المنتجات التي يملكها هذا التاجر فقط
      const { data: prodData, error } = await dbService.get('products', { eq: { vendor_id: user.uid } });
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
  }, [navigation, user]);

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

      {/* Loading state */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ marginTop: 10, color: colors.text }}>
            {language === 'ar' ? 'جاري تحميل منتجاتك...' : 'Loading your products...'}
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
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
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={{ padding: 16 }}
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
