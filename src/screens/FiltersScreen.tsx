import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useAdvancedFilters } from '../contexts/AdvancedFiltersContext';
import { CATEGORIES_WITH_ICONS } from '../shared/constants/productConstants';

const FiltersScreen = ({ navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { state, setPriceRange, setMinRating, toggleCategory, setInStock, setSortBy, resetFilters, applyFilters, clearFilters } = useAdvancedFilters();
  
  const [tempPriceRange, setTempPriceRange] = useState({ min: state.filters.priceRange.min, max: state.filters.priceRange.max });
  const [tempMinRating, setTempMinRating] = useState(state.filters.minRating);
  const [tempInStock, setTempInStock] = useState(state.filters.inStock);
  const [tempSortBy, setTempSortBy] = useState(state.filters.sortBy);
  const [tempCategories, setTempCategories] = useState<string[]>(state.filters.categories);

  const styles = getStyles(isDarkMode, colors);

  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange.min, tempPriceRange.max);
    setMinRating(tempMinRating);
    setInStock(tempInStock);
    setSortBy(tempSortBy);
    
    tempCategories.forEach(cat => {
      if (!state.filters.categories.includes(cat)) {
        toggleCategory(cat);
      }
    });
    
    applyFilters();
    navigation.goBack();
  };

  const handleClearFilters = () => {
    setTempPriceRange({ min: 0, max: 100000 });
    setTempMinRating(0);
    setTempInStock(false);
    setTempSortBy('newest');
    setTempCategories([]);
    clearFilters();
    navigation.goBack();
  };

  const handleResetFilters = () => {
    setTempPriceRange({ min: 0, max: 100000 });
    setTempMinRating(0);
    setTempInStock(false);
    setTempSortBy('newest');
    setTempCategories([]);
    resetFilters();
  };

  const handleToggleCategory = (category: string) => {
    setTempCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setTempMinRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={28}
              color={star <= rating ? "#FFD700" : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const sortOptions = [
    { value: 'newest', label: language === 'ar' ? 'الأحدث' : 'Newest' },
    { value: 'price-asc', label: language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
    { value: 'price-desc', label: language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' },
    { value: 'rating-desc', label: language === 'ar' ? 'التقييم: الأعلى' : 'Rating: Highest' },
    { value: 'name-asc', label: language === 'ar' ? 'الاسم: أ-ي' : 'Name: A-Z' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "🔍 الفلاتر المتقدمة" : "🔍 Advanced Filters"}
        </Text>
        <TouchableOpacity onPress={handleClearFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>
            {language === "ar" ? "مسح الكل" : "Clear All"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "نطاق السعر" : "Price Range"}
          </Text>
          <View style={styles.priceRangeContainer}>
            <Text style={styles.priceLabel}>
              {language === "ar" ? "من" : "Min"}: {tempPriceRange.min} ر.ي
            </Text>
            <Text style={styles.priceLabel}>
              {language === "ar" ? "إلى" : "Max"}: {tempPriceRange.max} ر.ي
            </Text>
          </View>
          <TextInput
            style={styles.priceInput}
            value={tempPriceRange.max.toString()}
            onChangeText={(text) => setTempPriceRange({ ...tempPriceRange, max: parseInt(text) || 0 })}
            keyboardType="numeric"
            placeholder="100000"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "التقييم الأدنى" : "Minimum Rating"}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(tempMinRating)}
            <Text style={styles.ratingLabel}>
              {tempMinRating > 0 ? `${tempMinRating}+` : language === 'ar' ? 'الكل' : 'All'}
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "الفئات" : "Categories"}
          </Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES_WITH_ICONS.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  tempCategories.includes(category.name) && styles.selectedCategory
                ]}
                onPress={() => handleToggleCategory(category.name)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={tempCategories.includes(category.name) ? "#fff" : colors.text}
                />
                <Text style={[
                  styles.categoryButtonText,
                  tempCategories.includes(category.name) && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* In Stock */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {language === "ar" ? "المتوفر فقط" : "In Stock Only"}
            </Text>
            <TouchableOpacity
              style={[styles.switch, tempInStock && styles.switchActive]}
              onPress={() => setTempInStock(!tempInStock)}
            >
              <View style={[styles.switchThumb, tempInStock && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === "ar" ? "ترتيب حسب" : "Sort By"}
          </Text>
          <View style={styles.sortOptionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  tempSortBy === option.value && styles.selectedSortOption
                ]}
                onPress={() => setTempSortBy(option.value as any)}
              >
                <Text style={[
                  styles.sortOptionText,
                  tempSortBy === option.value && styles.selectedSortOptionText
                ]}>
                  {option.label}
                </Text>
                {tempSortBy === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetFilters}
          >
            <Text style={styles.resetButtonText}>
              {language === "ar" ? "إعادة تعيين" : "Reset"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>
              {language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.header,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  sortOptionsContainer: {
    gap: 8,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  selectedSortOption: {
    backgroundColor: colors.primary + "20",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedSortOptionText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FiltersScreen;
