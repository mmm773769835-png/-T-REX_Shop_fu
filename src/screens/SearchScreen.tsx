import React, { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useSearch } from '../contexts/SearchContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { dbService } from '../services/SupabaseService';
import { sanitizeImageUrl } from '../utils/imageUtils';

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s\u0600-\u06FF]/gi, "")
    .trim();

// دالة debouncing لتحسين الأداء
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  const { state: searchState, setQuery, addToHistory, clearHistory, generateSuggestions } = useSearch();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const styles = getStyles(isDarkMode, colors);

  // Load all products from Supabase when component mounts
  useEffect(() => {
    setLoading(true);

    const loadProducts = async () => {
      const { data, error } = await dbService.get('products', {
        order: { column: 'created_at', ascending: false }
      });

      if (error) {
        console.error('Error loading products:', error);
        setLoading(false);
        return;
      }

      const items: any[] = [];

      if (data) {
        data.forEach((item: any) => {
          if (item && item.name) {
            items.push({
              id: item.id,
              name: item.name,
              price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
              description: item.description || "",
              imageUrl: item.image_url || item.imageUrl || "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image",
              image_url: item.image_url || item.imageUrl,
              images: item.images || (item.image_url ? [item.image_url] : []),
              category: item.category || "غير مصنف",
              currency: item.currency || "YER",
              paymentMethod: item.payment_method || item.paymentMethod || "cash",
              old_price: item.old_price || item.original_price || null,
              originalPrice: item.original_price || item.old_price || null,
              discount: item.discount || 0,
              is_new: item.is_new || false,
              stock: item.stock ?? item.quantity ?? null,
              attribute: item.attribute || item.status || "",
            });
          }
        });
      }

      setAllProducts(items);
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery.length > 0) {
      const newSuggestions = generateSuggestions(searchQuery, allProducts);
      setSuggestions(newSuggestions);
      setShowResults(true); // Show results immediately when typing
    } else {
      setSuggestions([]);
      setShowResults(false);
    }
  }, [searchQuery, allProducts, generateSuggestions]);

  // Filter products based on search query with debouncing
  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      setIsSearching(true);
      const filtered = allProducts.filter((product: any) => {
        const normalizedQuery = normalizeText(debouncedSearchQuery);
        const searchableText = normalizeText([
          product.name,
          product.category,
          product.description,
          product.attribute,
          product.currency,
          product.price,
        ].filter(Boolean).join(' '));
        return searchableText.includes(normalizedQuery);
      });
      setFilteredProducts(filtered);
      setShowResults(true);
      setIsSearching(false);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  }, [debouncedSearchQuery, allProducts]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setQuery(query);
    await addToHistory(query);
    setShowResults(true);
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setQuery(suggestion);
    await addToHistory(suggestion);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setQuery("");
    setShowResults(false);
  };

  const handleProductPress = (product: any) => {
    // @ts-ignore
    navigation.navigate('ProductDetails', { product });
  };

  const renderProduct = ({ item }: { item: any }) => {
    const originalPrice = item.originalPrice || item.old_price;
    const discountPercent = originalPrice && originalPrice > item.price
      ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
      : item.discount || 0;
    const imageUrl = sanitizeImageUrl(item.image_url || item.images?.[0] || item.imageUrl || 'https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image');
    const stockValue = item.stock ?? item.quantity;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
            </View>
          )}
          {item.is_new && (
            <View style={styles.newBadge}>
              <Text style={styles.badgeText}>{language === "ar" ? "جديد" : "New"}</Text>
            </View>
          )}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          {!!item.description && (
            <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPrice(item.price, (item.currency || 'YER') as any)}</Text>
            {originalPrice && originalPrice > item.price && (
              <Text style={styles.originalPrice}>{formatPrice(originalPrice, (item.currency || 'YER') as any)}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            {!!item.attribute && (
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{item.attribute}</Text>
              </View>
            )}
            {stockValue !== null && stockValue !== undefined && (
              <View style={[styles.metaBadge, Number(stockValue) > 0 ? styles.stockBadge : styles.outOfStockBadge]}>
                <Text style={styles.metaText}>
                  {Number(stockValue) > 0 ? (language === "ar" ? "متوفر" : "In stock") : (language === "ar" ? "نفد" : "Out")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === "ar" ? "ابحث عن منتجات..." : "Search products..."}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            autoFocus
          />
          {isSearching ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!showResults && searchQuery.length === 0 && (
          <>
            {/* Recent Searches */}
            {searchState.recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {language === "ar" ? "🔍 عمليات البحث الأخيرة" : "🔍 Recent Searches"}
                  </Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={styles.clearHistoryText}>
                      {language === "ar" ? "مسح الكل" : "Clear All"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {searchState.recentSearches.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyItem}
                    onPress={() => handleSuggestionPress(query)}
                  >
                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                    <Text style={styles.historyText}>{query}</Text>
                    <Ionicons name="arrow-up" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === "ar" ? "🔥 عمليات البحث الشائعة" : "🔥 Popular Searches"}
              </Text>
              <View style={styles.popularSearchesContainer}>
                {["T-Rex", "ديناصور", "ألعاب", "هدايا", "أطفال", "تعليمي"].map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularSearchItem}
                    onPress={() => handleSuggestionPress(term)}
                  >
                    <Text style={styles.popularSearchText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !showResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === "ar" ? "💡 اقتراحات" : "💡 Suggestions"}
            </Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Ionicons name="search" size={16} color={colors.textSecondary} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Results */}
        {showResults && (
          <View>
            <Text style={styles.resultsTitle}>
              {language === "ar" ? `📦 ${filteredProducts.length} نتيجة` : `📦 ${filteredProducts.length} results`}
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  {language === "ar" ? "جاري البحث..." : "Searching..."}
                </Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>
                  {language === "ar" ? "لا توجد نتائج" : "No results found"}
                </Text>
                <Text style={styles.emptyText}>
                  {language === "ar" ? "جرب كلمات بحث أخرى" : "Try different search terms"}
                </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {filteredProducts.map((product, index) => (
                  <View key={product.id} style={styles.productWrapper}>
                    {renderProduct({ item: product })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.header,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  clearHistoryText: {
    fontSize: 14,
    color: colors.primary,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginHorizontal: 12,
  },
  popularSearchesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  popularSearchItem: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularSearchText: {
    fontSize: 14,
    color: colors.text,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#00c853",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    color: colors.gold,
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stockBadge: {
    backgroundColor: "#1b5e20",
  },
  outOfStockBadge: {
    backgroundColor: "#b71c1c",
  },
  metaText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

export default SearchScreen;
