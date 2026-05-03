import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types
interface PriceRange {
  min: number;
  max: number;
}

interface FilterOptions {
  priceRange: PriceRange;
  minRating: number;
  categories: string[];
  inStock: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'rating-desc' | 'newest' | 'name-asc';
}

interface AdvancedFiltersState {
  filters: FilterOptions;
  isFilterApplied: boolean;
}

interface AdvancedFiltersContextType {
  state: AdvancedFiltersState;
  setPriceRange: (min: number, max: number) => void;
  setMinRating: (rating: number) => void;
  toggleCategory: (category: string) => void;
  setInStock: (inStock: boolean) => void;
  setSortBy: (sortBy: FilterOptions['sortBy']) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

// Initial state
const initialFilters: FilterOptions = {
  priceRange: { min: 0, max: 100000 },
  minRating: 0,
  categories: [],
  inStock: false,
  sortBy: 'newest',
};

const initialState: AdvancedFiltersState = {
  filters: initialFilters,
  isFilterApplied: false,
};

// Create context
const AdvancedFiltersContext = createContext<AdvancedFiltersContextType | undefined>(undefined);

// Provider component
export const AdvancedFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdvancedFiltersState>(initialState);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(initialFilters);

  const setPriceRange = (min: number, max: number) => {
    setTempFilters(prev => ({
      ...prev,
      priceRange: { min, max },
    }));
  };

  const setMinRating = (rating: number) => {
    setTempFilters(prev => ({
      ...prev,
      minRating: rating,
    }));
  };

  const toggleCategory = (category: string) => {
    setTempFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const setInStock = (inStock: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      inStock,
    }));
  };

  const setSortBy = (sortBy: FilterOptions['sortBy']) => {
    setTempFilters(prev => ({
      ...prev,
      sortBy,
    }));
  };

  const resetFilters = () => {
    setTempFilters(initialFilters);
  };

  const applyFilters = () => {
    setState({
      filters: tempFilters,
      isFilterApplied: true,
    });
  };

  const clearFilters = () => {
    setTempFilters(initialFilters);
    setState({
      filters: initialFilters,
      isFilterApplied: false,
    });
  };

  return (
    <AdvancedFiltersContext.Provider
      value={{
        state,
        setPriceRange,
        setMinRating,
        toggleCategory,
        setInStock,
        setSortBy,
        resetFilters,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </AdvancedFiltersContext.Provider>
  );
};

// Custom hook to use advanced filters context
export const useAdvancedFilters = () => {
  const context = useContext(AdvancedFiltersContext);
  
  if (context === undefined) {
    throw new Error('useAdvancedFilters must be used within an AdvancedFiltersProvider');
  }
  
  return context;
};

export default AdvancedFiltersContext;
