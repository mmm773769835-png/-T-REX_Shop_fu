import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, onSnapshot, query, orderBy, addDoc, getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// استيراد db من ملف AuthService بدلاً من إنشائه مباشرة
import { db } from "../../services/FirebaseAuthService";
import SidebarV2 from "./components/SidebarV2";
import Button from "../shared/components/Button";
import { useCart } from "../contexts/CartContext";
import { CATEGORIES_WITH_ICONS } from "../shared/constants/productConstants";

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
  paymentMethod?: string;
  category?: string;
  quantity?: number; // Added quantity property
}

interface RouteParams {
  admin?: boolean;
  loggedIn?: boolean;
}

const HomeV2: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const routeParams = route.params as RouteParams | undefined;
  const routeAdmin = routeParams?.admin || false;
  const routeLoggedIn = routeParams?.loggedIn || false;
  const [isAdmin, setIsAdmin] = useState(routeAdmin);
  const [isLoggedIn, setIsLoggedIn] = useState(routeLoggedIn || routeAdmin);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"ar" | "en">("ar");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addToCart } = useCart(); // Use cart context
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(width));
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("جميع المنتجات");

  // التحقق من دور المشرف عند تحميل الشاشة
  useEffect(() => {
    const checkUserRole = async () => {
      if (routeLoggedIn || routeAdmin) {
        const auth = getAuth(); // الحصول على مثيل المصادقة
        const currentUser = auth.currentUser;
        if (currentUser) {
          // التحقق من دور المشرف من قاعدة البيانات
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
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

  // 🧪 إضافة منتجات تجريبية (للتطوير)
  const addDemoProducts = async () => {
    try {
      console.log("🧪 جاري إضافة منتجات تجريبية...");
      
      const demoProducts = [
        {
          name: "هاتف ذكي",
          price: 299.99,
          description: "هاتف حديث بكاميرا عالية الدقة وذاكرة واسعة",
          category: "إلكترونيات",
          attribute: "جديد",
          paymentMethod: "cash",
          imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=📱",
          createdAt: new Date().toISOString(),
        },
        {
          name: "قميص رياضي",
          price: 29.99,
          description: "قميص مريح للرياضة مصنوع من مواد عالية الجودة",
          category: "ملابس",
          attribute: "جديد",
          paymentMethod: "card",
          imageUrl: "https://via.placeholder.com/300x300/50C878/FFFFFF?text=👕",
          createdAt: new Date().toISOString(),
        },
        {
          name: "كتاب برمجة",
          price: 19.99,
          description: "كتاب شامل لتعلم البرمجة من الصفر إلى الاحتراف",
          category: "كتب",
          attribute: "جديد",
          paymentMethod: "transfer",
          imageUrl: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=📚",
          createdAt: new Date().toISOString(),
        },
        {
          name: "سماعة لاسلكية",
          price: 89.99,
          description: "سماعة بلوتوث عالية الجودة مع إلغاء الضوضاء",
          category: "إلكترونيات",
          attribute: "مميز",
          paymentMethod: "cash",
          imageUrl: "https://via.placeholder.com/300x300/9B59B6/FFFFFF?text=🎧",
          createdAt: new Date().toISOString(),
        },
        {
          name: "حقيبة سفر",
          price: 49.99,
          description: "حقيبة سفر كبيرة بجودة عالية ومتينة",
          category: "منزلية",
          attribute: "جديد",
          paymentMethod: "card",
          imageUrl: "https://via.placeholder.com/300x300/F39C12/FFFFFF?text=👜",
          createdAt: new Date().toISOString(),
        }
      ];

      // Add all demo products
      for (const product of demoProducts) {
        const docRef = await addDoc(collection(db, "products"), product);
        console.log(`✅ تم إضافة المنتج: ${product.name} بـ ID: ${docRef.id}`);
      }
      
      console.log("✅ تم إضافة جميع المنتجات التجريبية بنجاح");
      Alert.alert("نجاح", "تمت إضافة جميع المنتجات التجريبية بنجاح");
    } catch (err) {
      console.error("❌ خطأ في إضافة المنتجات التجريبية:", err);
      Alert.alert("خطأ", "فشل في إضافة المنتجات التجريبية");
    }
  };

  // تحديث المنتجات يدويًا (زر Refresh)
  const refreshProducts = () => {
    console.log("🔄 جاري تحديث المنتجات يدويًا...");
    setLoading(true);
    
    // إعادة تحميل المنتجات بعد 500 مللي ثانية
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // 📦 تحميل المنتجات من Firestore
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
      // إنشاء استعلام لترتيب المنتجات حسب الوقت
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      
      // التحقق من صحة الاستعلام
      console.log("🔍 جاري تنفيذ الاستعلام لتحميل المنتجات...");
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          console.log("📥 تم استلام تحديث من قاعدة البيانات. عدد الوثائق:", snapshot.docs.length);
          
          // معالجة الوثائق مباشرة إلى مصفوفة منتجات
          const items: Product[] = [];
          
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            console.log("📄 بيانات الوثيقة:", doc.id, data);
            
            // التأكد من أن البيانات تحتوي على الحقول المطلوبة
            if (data && data.name && data.price !== undefined) {
              items.push({
                id: doc.id,
                name: data.name || "منتج غير مسمى",
                price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
                description: data.description || "لا يوجد وصف",
                imageUrl: data.imageUrl || "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image",
                category: data.category || "غير مصنف",
                paymentMethod: data.paymentMethod || "cash"
              });
            } else {
              console.warn("⚠️ تم تجاهل وثيقة بها بيانات ناقصة:", doc.id, data);
            }
          });
          
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
        } catch (err) {
          console.error("❌ خطأ في معالجة البيانات:", err);
          setError("فشل في معالجة البيانات");
          setLoading(false);
        }
      }, (error) => {
        console.error("❌ خطأ في تحميل المنتجات:", error);
        setError("فشل في تحميل المنتجات. يرجى التحقق من الاتصال بالإنترنت.");
        setLoading(false);
      });

      // تنظيف المستمع عند إزالة المكون
      return () => unsubscribe();
    } catch (err) {
      console.error("❌ خطأ في تحميل المنتجات:", err);
      setError("فشل في تحميل المنتجات. يرجى التحقق من الاتصال بالإنترنت.");
      setLoading(false);
    }
  }, []);

  // 🛒 إضافة منتج إلى السلة (updated to use context)
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    Alert.alert("✅", `تم إضافة ${product.name} إلى السلة`);
  };

  // 🎨 عرض القسم
  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.name && styles.selectedCategory,
        { backgroundColor: isDarkMode ? "#333" : "#e0e0e0" }
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.name ? "#007bff" : (isDarkMode ? "#fff" : "#333")} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.name && styles.selectedCategoryText,
        { color: isDarkMode ? "#fff" : "#333" }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // 📦 عرض المنتج
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('ProductDetails', { product: item });
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: isDarkMode ? "#fff" : "#333" }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.productDescription, { color: isDarkMode ? "#ccc" : "#666" }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: isDarkMode ? "#4da6ff" : "#007bff" }]}>
            {item.price.toFixed(2)} ر.س
          </Text>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // تصفية المنتجات حسب القسم والبحث
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // تصفية حسب القسم
      const categoryMatch = selectedCategory === "جميع المنتجات" || 
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
    <View style={[styles.header, { backgroundColor: isDarkMode ? "#222" : "#007bff" }]}>
      {/* زر الإعدادات */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSidebarVisible(true)}
      >
        <Ionicons name="settings" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* شعار التطبيق */}
      <Text style={styles.headerTitle}>🏪 متجر T-REX</Text>
      
      {/* زر البحث */}
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => {
          // @ts-ignore
          navigation.navigate('Search');
        }}
      >
        <Ionicons name="search" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // 🎨 عرض شريط البحث
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" }]}>
      <Ionicons name="search" size={20} color={isDarkMode ? "#ccc" : "#666"} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: isDarkMode ? "#444" : "#fff",
          color: isDarkMode ? "#fff" : "#333"
        }]}
        placeholder="ابحث عن منتجات..."
        placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close" size={20} color={isDarkMode ? "#ccc" : "#666"} />
        </TouchableOpacity>
      ) : null}
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
            جاري تحميل المنتجات...
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
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube" size={48} color={isDarkMode ? "#666" : "#ccc"} />
          <Text style={[styles.emptyText, { color: isDarkMode ? "#999" : "#999" }]}>
            لا توجد منتجات متاحة
          </Text>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={addDemoProducts}
            >
              <Text style={styles.demoText}>إضافة منتج تجريبي</Text>
            </TouchableOpacity>
          )}
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
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#111" : "#f5f5f5" }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCategories()}
      
      <View style={styles.content}>
        {/* زر إضافة منتجات تجريبية في وضع التطوير */}
        {__DEV__ && (
          <View style={styles.devButtonContainer}>
            <Button 
              title="إضافة منتجات تجريبية" 
              onPress={addDemoProducts}
              variant="success"
              size="small"
            />
          </View>
        )}
        
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
        onToggleLanguage={() => setCurrentLanguage(currentLanguage === "ar" ? "en" : "ar")}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
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
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        currentLanguage={currentLanguage}
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
    padding: 16,
    paddingTop: 40,
  },
  settingsButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoriesContainer: {
    height: 80,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: "#007bff",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: "#fff",
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
    padding: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  productCard: {
    flex: 0.48,
    borderRadius: 12,
    margin: 4,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
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
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addToCartButton: {
    backgroundColor: "#007bff",
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