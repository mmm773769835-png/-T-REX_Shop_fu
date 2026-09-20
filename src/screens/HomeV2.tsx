import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { dbService, authService } from '../services/SupabaseService';
import SidebarV2 from "./components/SidebarV2";
import Button from "../shared/components/Button";
import { useCart } from "../contexts/CartContext";
import { CATEGORIES_WITH_ICONS } from "../shared/constants/productConstants";
import { ThemeContext } from "../contexts/ThemeContext";
import { LanguageContext } from '../contexts/LanguageContext';
import { useAdvancedFilters } from '../contexts/AdvancedFiltersContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get("window");

const normalizeText = (text: string): string => {
  if (!text) return "";
  // تحويل النص إلى سلسلة
  const str = String(text);
  // إزالة المسافات الزائدة
  const trimmed = str.trim();
  // التحقق إذا كان النص يحتوي على أحرف عربية
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  
  if (hasArabic) {
    // للنص العربي: إزالة التشكيل فقط والحفاظ على الحروف
    return trimmed
      .normalize("NFC")
      .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة علامات التشكيل العربية
      .replace(/\s+/g, " ") // إزالة المسافات المتعددة
      .trim();
  } else {
    // للنص الإنجليزي: التحويل إلى أحرف صغيرة وإزالة الرموز
    return trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // إزالة علامات التشكيل اللاتينية
      .replace(/[^\w\s]/gi, "") // إزالة الرموز غير الكلمة
      .replace(/\s+/g, " ") // إزالة المسافات المتعددة
      .trim();
  }
};

// قائمة الأقسام المتاحة
const CATEGORIES = [...CATEGORIES_WITH_ICONS];

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  images?: string[];
  paymentMethod?: string;
  category?: string;
  quantity?: number;
  currency?: string;
  discount?: number;
  originalPrice?: number;
  old_price?: number;
  is_new?: boolean;
  is_featured?: boolean | string | number;
  stock?: number;
  attribute?: string;
  vendor_code?: string;
  vendor_id?: string;
}

interface RouteParams {
  admin?: boolean;
  loggedIn?: boolean;
}

const HomeV2: React.FC = ({ route, navigation }: any) => {
  const routeParams = route.params as RouteParams | undefined;
  const routeAdmin = routeParams?.admin || false;
  const routeLoggedIn = routeParams?.loggedIn || false;
  const [isAdmin, setIsAdmin] = useState(routeAdmin);
  const [isLoggedIn, setIsLoggedIn] = useState(routeLoggedIn || routeAdmin);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { language, switchLanguage } = useContext(LanguageContext);
  const { formatPrice, formatPriceWithSource, currency, setCurrency, currencyRates } = useCurrency();
  const { signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appCategories, setAppCategories] = useState([...CATEGORIES_WITH_ICONS]);
  const { addToCart } = useCart(); // Use cart context
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(width));
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(language === "ar" ? "جميع المنتجات" : "All Products");
  const { state: filterState } = useAdvancedFilters();
  const [currencyDropdownVisible, setCurrencyDropdownVisible] = useState(false);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };
  const searchDropdownResults = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery);
    if (!normalizedSearch) {
      return [];
    }

    return products
      .filter(product =>
        normalizeText([
          product.name,
          product.description,
          product.category,
          product.attribute,
          product.currency,
          product.price,
        ].filter(Boolean).join(' ')).includes(normalizedSearch)
      )
      .slice(0, 8);
  }, [products, searchQuery]);

  // التحقق من دور المشرف عند تحميل الشاشة
  useEffect(() => {
    const checkUserRole = async () => {
      if (routeLoggedIn || routeAdmin) {
        const { user } = await authService.getCurrentUser();
        if (user) {
          // التحقق من دور المشرف من قاعدة البيانات
          try {
            const { data, error } = await dbService.get('users', { eq: { id: user.id } });
            if (data && data.length > 0) {
              const userData = data[0];
              setIsAdmin(userData.role === "admin");
            }
          } catch (error) {
            console.error("خطأ في التحقق من دور المشرف:", error);
          }
        }
      }
    };

    checkUserRole();
  }, [routeLoggedIn, routeAdmin]);

  // 📦 تحديث حالة تسجيل الدخول عند تغيير route params
  useEffect(() => {
    const routeParams = route.params as RouteParams | undefined;
    const routeAdmin = routeParams?.admin || false;
    const routeLoggedIn = routeParams?.loggedIn || false;
    setIsAdmin(routeAdmin);
    setIsLoggedIn(routeLoggedIn || routeAdmin);
  }, [route.params]);

  // تحديث selectedCategory عند تغيير اللغة
  useEffect(() => {
    if (selectedCategory === "جميع المنتجات" || selectedCategory === "All Products") {
      setSelectedCategory(language === "ar" ? "جميع المنتجات" : "All Products");
    }
  }, [language, selectedCategory]);

  // 🔗 Handling deep link product URL param on Web / Mobile
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const targetProductId = urlParams.get('product') || 
                                urlParams.get('productId') || 
                                urlParams.get('product_id') || 
                                urlParams.get('id');
        if (targetProductId) {
          console.log('🔗 Deep link product param detected in HomeV2:', targetProductId);
          navigation.navigate('ProductDetails', { productId: targetProductId });
        }
      }
    } catch (e) {
      console.log('Error checking deep link URL in HomeV2', e);
    }
  }, [navigation]);

  // تحديث المنتجات يدويًا (زر Refresh)
  const refreshProducts = () => {
    console.log("🔄 جاري تحديث المنتجات يدويًا...");
    setLoading(true);
    
    // إعادة تحميل المنتجات بعد 500 مللي ثانية
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // 📦 تحميل المنتجات من Supabase
  useEffect(() => {
    // في حالة التطوير، يمكن استخدام بيانات تجريبية
    const USE_DEMO_DATA = false; // غيّر إلى true لاستخدام بيانات تجريبية

    if (USE_DEMO_DATA) {
      // بيانات تجريبية للتطوير
      const demoProducts: Product[] = [
        {
          id: "1",
          name: "هاتف ذكي",
          price: 299.99,
          description: "هاتف حديث بكاميرا عالية الدقة",
          imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=📱",
          category: "إلكترونيات"
        },
        {
          id: "2",
          name: "قميص رياضي",
          price: 29.99,
          description: "قميص مريح للرياضة",
          imageUrl: "https://via.placeholder.com/300x300/50C878/FFFFFF?text=👕",
          category: "ملابس"
        },
        {
          id: "3",
          name: "كتاب برمجة",
          price: 19.99,
          description: "كتاب شامل لتعلم البرمجة",
          imageUrl: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=📚",
          category: "كتب"
        }
      ];

      setTimeout(() => {
        setProducts(demoProducts);
        setLoading(false);
        setError(null);
        console.log("✅ تم تحميل البيانات التجريبية");
      }, 1000);

      return;
    }

    try {
      // تحميل المنتجات من Supabase
      console.log("🔍 جاري تنفيذ الاستعلام لتحميل المنتجات...");

      const loadProducts = async () => {
        // Fetch categories first
        try {
          const { data: catData, error: catError } = await dbService.get('categories');
          if (!catError && catData && catData.length > 0) {
            const mappedCats = catData.map((cat: any) => ({
              id: cat.id,
              name: cat.name_en,
              nameAr: cat.name_ar,
              icon: cat.icon || 'star-outline'
            }));
            setAppCategories(mappedCats);
          }
        } catch (catErr) {
          console.log('Categories fetch error', catErr);
        }

        try {
          const { data: profsData } = await dbService.get('profiles');
          if (profsData && profsData.length > 0) {
            const map: Record<string, any> = {};
            profsData.forEach((p: any) => { map[p.id] = p; });
            setProfilesMap(map);
          }
        } catch (e) { console.log('Profiles fetch error', e); }

        const { data, error } = await dbService.get('products', {
          order: { column: 'created_at', ascending: false }
        });

        if (error) {
          console.error("❌ خطأ في تحميل المنتجات:", error);
          setError("فشل في تحميل المنتجات. يرجى التحقق من الاتصال بالإنترنت.");
          setLoading(false);
          return;
        }

        console.log("📥 تم استلام تحديث من قاعدة البيانات. عدد الوثائق:", data?.length || 0);

        // معالجة البيانات إلى مصفوفة منتجات
        const items: Product[] = [];

        if (data) {
          data.forEach((item: any) => {
            console.log("📄 بيانات الوثيقة:", item.id, item);

            // التأكد من أن البيانات تحتوي على الحقول المطلوبة
            if (item && item.name && item.price !== undefined) {
              items.push({
                id: item.id,
                name: item.name || "منتج غير مسمى",
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
                description: item.description || "لا يوجد وصف",
                imageUrl: item.image_url || item.imageUrl || "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image",
                images: item.images || (item.image_url ? [item.image_url] : []),
                category: item.category || "غير مصنف",
                paymentMethod: item.payment_method || item.paymentMethod || "cash",
                currency: item.currency || "YER",
                discount: item.discount || 0,
                originalPrice: item.original_price || item.old_price || item.originalPrice || null,
                old_price: item.old_price || item.original_price || null,
                is_new: item.is_new || false,
                is_featured: item.is_featured || false,
                stock: item.stock ?? item.quantity ?? null,
                attribute: item.attribute || item.status || "",
                vendor_code: item.vendor_code || "VND-MAIN",
                vendor_id: item.vendor_id || null
              });
            } else {
              console.warn("⚠️ تم تجاهل وثيقة بها بيانات ناقصة:", item.id, item);
            }
          });
        }

        console.log("📦 المنتجات المحولة:", items);

        setProducts(items);
        setLoading(false);
        setError(null);

        // طباعة معلومات التصحيح
        console.log("✅ تم تحميل المنتجات:", items.length);
        if (items.length > 0) {
          console.log("📝 أول منتج:", items[0]);
        } else {
          console.log("📝 لا توجد منتجات في قاعدة البيانات");
        }
      };

      loadProducts();

      // يمكن إضافة Realtime subscription هنا إذا لزم الأمر
      // const subscription = dbService.subscribe('products', (payload) => {
      //   console.log('Realtime update:', payload);
      //   loadProducts();
      // });

      // return () => {
      //   subscription.unsubscribe();
      // };
    } catch (err) {
      console.error("❌ خطأ في تحميل المنتجات:", err);
      setError("فشل في تحميل المنتجات. يرجى التحقق من الاتصال بالإنترنت.");
      setLoading(false);
    }
  }, []);

  // 🛒 إضافة منتج إلى السلة (updated to use context)
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(language === "ar" ? `تم إضافة ${product.name} إلى السلة 🛒` : `${product.name} added to cart 🛒`);
  };

  // 🎨 عرض القسم
  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isSelected = selectedCategory === (language === "ar" ? item.nameAr : item.name);
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected ? styles.selectedCategory : { backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0" }
        ]}
        onPress={() => setSelectedCategory(language === "ar" ? item.nameAr : item.name)}
      >
        <Ionicons 
          name={item.icon as any} 
          size={16} 
          color={isSelected ? "#1a1a1a" : (isDarkMode ? "#FFD700" : "#555")} 
        />
        <Text style={[
          styles.categoryText,
          { color: isSelected ? "#1a1a1a" : (isDarkMode ? "#ccc" : "#555") }
        ]}>
          {language === "ar" ? item.nameAr : item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // 📦 عرض المنتج
  const renderProduct = ({ item }: { item: Product }) => {
    const discountPercent = item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }]}
        activeOpacity={0.9}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('ProductDetails', { product: item });
        }}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: (item.images && item.images.length > 0) ? item.images[0] : item.imageUrl }} 
            style={styles.productImage}
            defaultSource={{ uri: 'https://via.placeholder.com/300x200/1a1a1a/FFD700?text=T-REX' }}
          />
          {/* Gradient overlay */}
          <View style={styles.imageOverlay} />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
            </View>
          )}
          {(item as any).condition === 'used' && (
            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#ff9800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 3 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                🏷️ {language === 'ar' ? 'مستعمل' : 'Used'}
              </Text>
            </View>
          )}
          {/* زر الإضافة للسلة فوق الصورة */}
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={18} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: isDarkMode ? "#fff" : "#1a1a1a" }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>
                  {formatPriceWithSource(item.originalPrice, item.currency || 'SAR', currency)}
                </Text>
              )}
              <Text style={styles.productPrice}>
                {formatPriceWithSource(item.price, item.currency || 'SAR', currency)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
              <Ionicons name="eye-outline" size={12} color="#FFD700" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFD700' }}>
                {(item as any).views_count || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // تصفية المنتجات حسب القسم والبحث
  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery);
    const filters = filterState.filters;
    const categoryFilterSet = new Set(filters.categories.map(category => normalizeText(category)));

    const filtered = products.filter(product => {
      // تصفية حسب القسم
      let categoryMatch = selectedCategory === (language === "ar" ? "جميع المنتجات" : "All Products");
      if (!categoryMatch && product.category) {
        const prodCat = normalizeText(product.category);
        const selCat = normalizeText(selectedCategory);
        categoryMatch = prodCat === selCat || prodCat.includes(selCat) || selCat.includes(prodCat);
      }
      
      // تصفية حسب البحث
      const searchMatch = !searchQuery || 
                         normalizeText([
                           product.name,
                           product.description,
                           product.category,
                           product.attribute,
                           product.currency,
                           product.price,
                         ].filter(Boolean).join(' ')).includes(normalizedSearch);

      // تصفية حسب السعر - تحويل السعر إلى العملة الحالية للمقارنة
      const sourceCurrency = product.currency || 'SAR';
      const sourceRate = currencyRates.find(r => r.code === sourceCurrency)?.rate || 1;
      const targetRate = currencyRates.find(r => r.code === currency)?.rate || 1;
      
      let priceInTargetCurrency = product.price;
      if (sourceCurrency === 'YER' && currency !== 'YER') {
        priceInTargetCurrency = product.price / targetRate;
      } else if (sourceCurrency !== 'YER' && currency === 'YER') {
        priceInTargetCurrency = product.price * sourceRate;
      } else if (sourceCurrency !== 'YER' && currency !== 'YER') {
        const priceInYER = product.price * sourceRate;
        priceInTargetCurrency = priceInYER / targetRate;
      }
      
      const priceMatch = priceInTargetCurrency >= filters.priceRange.min && priceInTargetCurrency <= filters.priceRange.max;
      const advancedCategoryMatch = !filters.categories.length || categoryFilterSet.has(normalizeText(product.category || ""));
      const stockValue = product.stock;
      const stockMatch = !filters.inStock || stockValue === undefined || stockValue === null || Number(stockValue) > 0;
      
      return categoryMatch && searchMatch && priceMatch && advancedCategoryMatch && stockMatch;
    });

    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'rating-desc':
          return 0;
        case 'newest':
        default:
          return 0;
      }
    });
  }, [products, selectedCategory, searchQuery, filterState.filters, language]);

  // 🎨 عرض الشريط العلوي
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: isDarkMode ? "#1a1a1a" : "#1a1a1a" }]}>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSidebarVisible(true)}
      >
        <Ionicons name="menu" size={26} color="#FFD700" />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image 
            source={require('../../logo.png')} 
            style={{ width: 32, height: 32, resizeMode: 'contain', marginEnd: 6 }} 
          />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerLogo}>T-REX</Text>
            <Text style={styles.headerSubtitle}>{language === "ar" ? "المتجر" : "SHOP"}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.currencyButton}
          onPress={() => setCurrencyDropdownVisible(!currencyDropdownVisible)}
        >
          <Text style={styles.currencyButtonText}>{currency}</Text>
          <Ionicons name="chevron-down" size={16} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Search');
          }}
        >
          <Ionicons name="search" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {currencyDropdownVisible && (
        <View style={styles.currencyDropdown}>
          {(['SAR', 'USD', 'KWD', 'AED', 'YER', 'EUR', 'BHD', 'OMR'] as const).map((curr) => (
            <TouchableOpacity
              key={curr}
              style={[
                styles.currencyOption,
                currency === curr && styles.selectedCurrencyOption
              ]}
              onPress={() => {
                setCurrency(curr);
                setCurrencyDropdownVisible(false);
              }}
            >
              <Text style={[
                styles.currencyOptionText,
                currency === curr && styles.selectedCurrencyOptionText
              ]}>
                {curr}
              </Text>
              {currency === curr && (
                <Ionicons name="checkmark" size={16} color="#FFD700" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // 🎨 عرض شريط البحث
  const renderSearchBar = () => (
    <View style={[styles.searchWrapper, { backgroundColor: isDarkMode ? "#1a1a1a" : "#1a1a1a" }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={[styles.searchContainer, { flex: 1, backgroundColor: isDarkMode ? "#2a2a2a" : "#2a2a2a" }]}>
          <Ionicons name="search" size={18} color="#FFD700" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: "#fff" }]}
            placeholder={language === "ar" ? "ابحث عن منتجات..." : "Search for products..."}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.topFilterBtn, filterState.isFilterApplied && styles.activeTopFilterBtn]}
          onPress={() => navigation.navigate('Filters')}
        >
          <Ionicons name="options-outline" size={20} color={filterState.isFilterApplied ? "#111" : "#FFD700"} />
        </TouchableOpacity>
      </View>
      {!!searchQuery.trim() && (
        <View style={styles.searchDropdown}>
          {searchDropdownResults.length === 0 ? (
            <Text style={styles.searchDropdownEmpty}>
              {language === "ar" ? "لا توجد نتائج للبحث" : "No search results"}
            </Text>
          ) : (
            <>
              {searchDropdownResults.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.searchDropdownItem}
                  onPress={() => {
                    setSearchQuery(product.name);
                    navigation.navigate('ProductDetails', { product });
                  }}
                >
                  <Image
                    source={{ uri: (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl }}
                    style={styles.searchDropdownImage}
                  />
                  <View style={styles.searchDropdownInfo}>
                    <Text style={styles.searchDropdownName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.searchDropdownPrice}>
                      {product.price.toLocaleString()} {product.currency === 'SAR' ? 'ر.س' : product.currency === 'USD' ? '$' : 'ر.ي'}
                    </Text>
                    {!!product.category && (
                      <Text style={styles.searchDropdownCategory} numberOfLines={1}>{product.category}</Text>
                    )}
                  </View>
                  <Ionicons name="arrow-back" size={18} color="#FFD700" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.searchDropdownFooter}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.searchDropdownFooterText}>
                  {language === "ar" ? "عرض كل النتائج المشابهة" : "Show all similar results"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );

  // 🌟 تصفية المنتجات المميزة مع فحص اشتراك التاجر
  const featuredProducts = useMemo(() => {
    const now = new Date();
    return products.filter((p) => {
      if (p.vendor_id && profilesMap[p.vendor_id]) {
        const prof = profilesMap[p.vendor_id];
        if (prof.role === 'admin') {
          const val = p.is_featured;
          return val === true || val === "true" || val === 1 || String(val) === "1";
        }
        const until = prof.featured_until ? new Date(prof.featured_until) : null;
        return until && until > now;
      }
      const val = p.is_featured;
      return val === true || val === "true" || val === 1 || String(val) === "1";
    }).slice(0, 12);
  }, [products, profilesMap]);

  // 🎨 عرض المنتجات المميزة
  const renderFeaturedProducts = () => {
    if (featuredProducts.length === 0) return null;

    return (
      <View style={styles.featuredSectionContainer}>
        <View style={styles.featuredHeader}>
          <Ionicons name="star" size={18} color="#FFD700" style={{ marginEnd: 6 }} />
          <Text style={[styles.featuredSectionTitle, { color: isDarkMode ? "#FFD700" : "#1a1a1a" }]}>
            {language === "ar" ? "منتجات مميزة" : "Featured Products"}
          </Text>
        </View>
        <FlatList
          data={featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `featured-${item.id}`}
          contentContainerStyle={styles.featuredListContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.featuredCard,
                { backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff", borderColor: isDarkMode ? "#333" : "#e5e5e5" }
              ]}
              activeOpacity={0.85}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('ProductDetails', { product: item });
              }}
            >
              <View style={styles.featuredImageContainer}>
                <Image
                  source={{ uri: (item.images && item.images.length > 0) ? item.images[0] : item.imageUrl }}
                  style={styles.featuredProductImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/300x200/1a1a1a/FFD700?text=T-REX' }}
                />
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={10} color="#1a1a1a" />
                  <Text style={styles.featuredBadgeText}>{language === 'ar' ? 'مميز' : 'Featured'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.featuredCartBtn}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="cart-outline" size={16} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
              <View style={styles.featuredInfo}>
                <Text style={[styles.featuredProductName, { color: isDarkMode ? "#fff" : "#1a1a1a" }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text style={styles.featuredProductPrice}>
                    {formatPriceWithSource(item.price, item.currency || 'SAR', currency)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                    <Ionicons name="eye-outline" size={11} color="#FFD700" style={{ marginRight: 2 }} />
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#FFD700' }}>
                      {(item as any).views_count || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };
    // 🚀 عرض بنر العروض الترويجي
  const renderPromoBanner = () => (
    <View style={styles.promoBannerWrapper}>
      <View style={[styles.promoBannerBox, { backgroundColor: isDarkMode ? "#1e1b4b" : "#2e1065" }]}>
        <View style={styles.promoBannerContent}>
          <View style={styles.promoBannerBadge}>
            <Ionicons name="flash" size={12} color="#111" />
            <Text style={styles.promoBannerBadgeText}>
              {language === 'ar' ? 'عروض الموسم الكبرى' : 'Season Super Sale'}
            </Text>
          </View>
          <Text style={styles.promoBannerTitle}>
            {language === 'ar' ? 'خصومات تصل إلى 50%' : 'Up to 50% OFF'}
          </Text>
          <Text style={styles.promoBannerSub}>
            {language === 'ar' ? 'تسوق أحدث المنتجات والساعات حصرياً' : 'Shop exclusive products & watches'}
          </Text>
        </View>
        <Ionicons name="gift-outline" size={54} color="rgba(255,215,0,0.35)" />
      </View>
    </View>
  );

  // 💀 عرض بطاقات التحميل الهيكلي Skeleton
  const renderSkeletons = () => (
    <View style={styles.skeletonGrid}>
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <View key={key} style={[styles.skeletonCard, { backgroundColor: isDarkMode ? "#1e1e1e" : "#e0e0e0" }]}>
          <View style={[styles.skeletonImage, { backgroundColor: isDarkMode ? "#2a2a2a" : "#c5c5c5" }]} />
          <View style={[styles.skeletonTextLine, { width: '80%', backgroundColor: isDarkMode ? "#2a2a2a" : "#c5c5c5" }]} />
          <View style={[styles.skeletonTextLine, { width: '40%', backgroundColor: isDarkMode ? "#2a2a2a" : "#c5c5c5" }]} />
        </View>
      ))}
    </View>
  );

  // 🎨 عرض أقسام المنتجات
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={appCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        renderItem={renderCategory}
      />
    </View>
  );

  // 🎨 عرض المنتجات
  const renderProducts = () => {
    if (loading) {
      return renderSkeletons();
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff4444" />
          <Text style={[styles.errorText, { color: isDarkMode ? "#ff8888" : "#ff4444" }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshProducts}
          >
            <Text style={styles.retryText}>{language === "ar" ? "إعادة المحاولة" : "Retry"}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube" size={48} color={isDarkMode ? "#666" : "#ccc"} />
          <Text style={[styles.emptyText, { color: isDarkMode ? "#999" : "#999" }]}>
            {language === "ar" ? "لا توجد منتجات متاحة" : "No products available"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refreshProducts}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#111" : "#f0f0f0" }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderPromoBanner()}
      {renderCategories()}
      {renderFeaturedProducts()}

      {/* عنوان المنتجات */}
      <View style={[styles.sectionHeader, { backgroundColor: isDarkMode ? "#111" : "#f0f0f0" }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFD700" : "#1a1a1a" }]}>
          {language === "ar" ? "🛍️ المنتجات" : "🛍️ Products"}
        </Text>
        <View style={styles.sectionActions}>
          <TouchableOpacity
            style={[styles.filterButton, filterState.isFilterApplied && styles.activeFilterButton]}
            onPress={() => navigation.navigate('Filters')}
          >
            <Ionicons name="options-outline" size={16} color={filterState.isFilterApplied ? "#111" : "#FFD700"} />
            <Text style={[styles.filterButtonText, filterState.isFilterApplied && styles.activeFilterButtonText]}>
              {language === "ar" ? "فلتر" : "Filter"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.sectionCount, { color: isDarkMode ? "#888" : "#888" }]}>
            {filteredProducts.length} {language === "ar" ? "منتج" : "items"}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {renderProducts()}
      </View>
      
      {/* زر إضافة منتج للمشرفين */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.adminAddButton}
          onPress={() => {
            // @ts-ignore
            navigation.navigate("AddProduct");
          }}
        >
          <Ionicons name="add-circle" size={60} color="#007bff" />
        </TouchableOpacity>
      )}

      {/* 🔔 Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
      
      {/* القائمة الجانبية */}
      <SidebarV2 
        onAddProduct={() => {
          // @ts-ignore
          navigation.navigate("AddProduct");
        }}
        onLoginLogout={async () => {
          if (isLoggedIn) {
            // Logout
            await signOut();
            setIsLoggedIn(false);
            setIsAdmin(false);
            // @ts-ignore
            navigation.navigate("Login");
          } else {
            // Login
            // @ts-ignore
            navigation.navigate("Login");
          }
        }}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#888",
    letterSpacing: 4,
    marginTop: -2,
  },
  settingsButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginRight: 4,
  },
  currencyDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectedCurrencyOption: {
    backgroundColor: "#FFD70020",
  },
  currencyOptionText: {
    fontSize: 14,
    color: "#fff",
  },
  selectedCurrencyOptionText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  searchButton: {
    padding: 8,
  },
  searchWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  topFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTopFilterBtn: {
    backgroundColor: "#FFD700",
  },
  searchDropdown: {
    marginTop: 8,
    backgroundColor: "#202020",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  searchDropdownEmpty: {
    color: "#888",
    padding: 14,
    textAlign: "center",
  },
  searchDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  searchDropdownImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#111",
  },
  searchDropdownInfo: {
    flex: 1,
  },
  searchDropdownName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  searchDropdownPrice: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  searchDropdownCategory: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },
  searchDropdownFooter: {
    padding: 12,
    alignItems: "center",
  },
  searchDropdownFooterText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "800",
  },
  categoriesContainer: {
    height: 52,
    backgroundColor: "transparent",
  },
  categoriesList: {
    paddingHorizontal: 14,
    alignItems: "center",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: "#FFD700",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 5,
  },
  selectedCategoryText: {
    color: "#1a1a1a",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeFilterButton: {
    backgroundColor: "#FFD700",
  },
  filterButtonText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "800",
  },
  activeFilterButtonText: {
    color: "#111",
  },
  sectionCount: {
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  demoButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  demoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productsList: {
    padding: 10,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  productCard: {
    flex: 0.48,
    borderRadius: 16,
    margin: 5,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "contain",
  },
  imageContainer: {
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "transparent",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B3B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  quickAddButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FFD700",
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: "line-through",
    color: "#999",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFD700",
  },
  addToCartButton: {
    backgroundColor: "#FFD700",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  devButtonContainer: {
    padding: 16,
    alignItems: "center",
  },
  adminAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuredSectionContainer: {
    marginVertical: 10,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  featuredSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredListContainer: {
    paddingHorizontal: 12,
  },
  featuredCard: {
    width: 150,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  featuredImageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  featuredProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  featuredBadgeText: {
    color: '#1a1a1a',
    fontSize: 9,
    fontWeight: 'bold',
  },
  featuredCartBtn: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#FFD700',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    padding: 8,
  },
  featuredProductName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredProductPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  promoBannerWrapper: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  promoBannerBox: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD70050',
    overflow: 'hidden',
  },
  promoBannerContent: {
    flex: 1,
  },
  promoBannerBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  promoBannerBadgeText: {
    color: '#111',
    fontSize: 11,
    fontWeight: '800',
  },
  promoBannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },
  promoBannerSub: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: '48%',
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  skeletonImage: {
    width: '100%',
    height: 130,
    borderRadius: 10,
  },
  skeletonTextLine: {
    height: 14,
    borderRadius: 6,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#1a1a1ae6',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default HomeV2;