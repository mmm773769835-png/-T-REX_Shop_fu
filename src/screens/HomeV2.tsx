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

const { width } = Dimensions.get("window");

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim();

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart(); // Use cart context
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(width));
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(language === "ar" ? "جميع المنتجات" : "All Products");

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
                originalPrice: item.original_price || item.originalPrice || null
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
    Alert.alert("✅", language === "ar" ? `تم إضافة ${product.name} إلى السلة` : `${product.name} added to cart`);
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
    const currencySymbol = item.currency === 'USD' ? '$' : item.currency === 'SAR' ? 'ر.س' : 'ر.ي';

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
                  {item.originalPrice.toLocaleString()} {currencySymbol}
                </Text>
              )}
              <Text style={styles.productPrice}>
                {item.price.toLocaleString()} {currencySymbol}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // تصفية المنتجات حسب القسم والبحث
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // تصفية حسب القسم
      const categoryMatch = selectedCategory === (language === "ar" ? "جميع المنتجات" : "All Products") ||
                           (product.category && product.category === selectedCategory);
      
      // تصفية حسب البحث
      const searchMatch = !searchQuery || 
                         normalizeText(product.name).includes(normalizeText(searchQuery)) ||
                         normalizeText(product.description).includes(normalizeText(searchQuery));
      
      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, searchQuery]);

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
        <Text style={styles.headerLogo}>T-REX</Text>
        <Text style={styles.headerSubtitle}>{language === "ar" ? "المتجر" : "SHOP"}</Text>
      </View>
      
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
  );

  // 🎨 عرض شريط البحث
  const renderSearchBar = () => (
    <View style={[styles.searchWrapper, { backgroundColor: isDarkMode ? "#1a1a1a" : "#1a1a1a" }]}>
      <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? "#2a2a2a" : "#2a2a2a" }]}>
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
    </View>
  );

  // 🎨 عرض أقسام المنتجات
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  // 🎨 عرض المنتجات
  const renderProducts = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, { color: isDarkMode ? "#ccc" : "#666" }]}>
            {language === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
          </Text>
        </View>
      );
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
      {renderCategories()}

      {/* عنوان المنتجات */}
      <View style={[styles.sectionHeader, { backgroundColor: isDarkMode ? "#111" : "#f0f0f0" }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFD700" : "#1a1a1a" }]}>
          {language === "ar" ? "🛍️ المنتجات" : "🛍️ Products"}
        </Text>
        <Text style={[styles.sectionCount, { color: isDarkMode ? "#888" : "#888" }]}>
          {filteredProducts.length} {language === "ar" ? "منتج" : "items"}
        </Text>
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
      
      {/* القائمة الجانبية */}
      <SidebarV2 
        onAddProduct={() => {
          // @ts-ignore
          navigation.navigate("AddProduct");
        }}
        onLoginLogout={() => {
          if (isLoggedIn) {
            // Logout
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
    resizeMode: "cover",
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
});

export default HomeV2;