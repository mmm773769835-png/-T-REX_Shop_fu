import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbService } from '../services/SupabaseService';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';

export default function AdminVendorsScreen({ navigation }: any) {
  const { language } = useContext(LanguageContext);
  const { isDarkMode, colors } = useContext(ThemeContext);

  const [vendors, setVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // جلب كافة التجار من جدول profiles حيث role = 'vendor'
      const { data: profData, error } = await dbService.get('profiles', { eq: { role: 'vendor' } });
      if (error) {
        console.error('Error fetching vendors:', error);
      } else {
        // حساب عدد المنتجات لكل تاجر
        const vendorsWithProductCount = await Promise.all(
          (profData || []).map(async (v: any) => {
            const { data: prods } = await dbService.get('products', { eq: { vendor_id: v.id } });
            return {
              ...v,
              productCount: prods ? prods.length : 0,
            };
          })
        );
        setVendors(vendorsWithProductCount);
      }
    } catch (err) {
      console.error('AdminVendors fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCallVendor = (phone: string) => {
    if (!phone) {
      Alert.alert(language === 'ar' ? 'تنبيه' : 'Notice', language === 'ar' ? 'رقم الهاتف غير متوفر لهذا التاجر' : 'Phone number not available');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل في إجراء الاتصال' : 'Could not launch call');
    });
  };

  const handleWhatsAppVendor = (phone: string) => {
    if (!phone) {
      Alert.alert(language === 'ar' ? 'تنبيه' : 'Notice', language === 'ar' ? 'رقم الهاتف غير متوفر لهذا التاجر' : 'Phone number not available');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'تطبيق الواتساب غير متوفر' : 'WhatsApp app not available');
    });
  };

  // تصفية التجار بحسب كود التاجر VND-XXXX أو الاسم أو اسم المتجر أو الهاتف
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const code = (v.vendor_code || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    const shop = (v.shop_name || '').toLowerCase();
    const phone = (v.phone || '').toLowerCase();
    return code.includes(q) || name.includes(q) || shop.includes(q) || phone.includes(q);
  });

  const renderVendorItem = ({ item }: { item: any }) => (
    <View style={[styles.vendorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.shopName, { color: colors.text }]}>
            🏬 {item.shop_name || item.name || 'متجر تاجر'}
          </Text>
          <Text style={[styles.vendorName, { color: colors.textSecondary }]}>
            👤 {item.name}
          </Text>
        </View>

        <View style={styles.codeBadge}>
          <Ionicons name="key-outline" size={14} color="#155724" />
          <Text style={styles.codeBadgeText}>{item.vendor_code || 'VND-NONE'}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          {item.phone || 'غير محدد'}
        </Text>
      </View>

      {item.address ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {item.address}
          </Text>
        </View>
      ) : null}

      <View style={styles.infoRow}>
        <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {language === 'ar' ? `عدد المنتجات: ${item.productCount}` : `Products Count: ${item.productCount}`}
        </Text>
      </View>

      {/* أزرار الاتصال السريع والتواصل عبر الواتساب */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: '#28a745' }]}
          onPress={() => handleWhatsAppVendor(item.phone)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={styles.contactBtnText}>
            {language === 'ar' ? 'محادثة واتساب' : 'WhatsApp'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: '#007bff' }]}
          onPress={() => handleCallVendor(item.phone)}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.contactBtnText}>
            {language === 'ar' ? 'اتصال مباشر' : 'Call'}
          </Text>
        </TouchableOpacity>
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

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {language === 'ar' ? 'دليل وأكواد التجار (Admin)' : 'Vendor Codes Directory'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input for Vendor Codes */}
      <View style={{ padding: 16 }}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={language === 'ar' ? 'ابحث بكود التاجر (VND-1001) أو اسم المتجر...' : 'Search by Vendor Code (VND-XXXX)...'}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#17a2b8" />
          <Text style={{ marginTop: 10, color: colors.text }}>
            {language === 'ar' ? 'جاري البحث وجلب التجار...' : 'Fetching vendors...'}
          </Text>
        </View>
      ) : filteredVendors.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {language === 'ar' ? 'لم يتم العثور على تجار بهذه البيانات' : 'No vendors found'}
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {language === 'ar' ? 'تأكد من كتابة كود التاجر بشكل صحيح مثل VND-1001' : 'Check code search query e.g. VND-1001'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id}
          renderItem={renderVendorItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchVendors();
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 5 },
  vendorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shopName: { fontSize: 16, fontWeight: 'bold' },
  vendorName: { fontSize: 13, marginTop: 2 },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  codeBadgeText: { color: '#155724', fontWeight: 'bold', fontSize: 13 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  infoText: { fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
