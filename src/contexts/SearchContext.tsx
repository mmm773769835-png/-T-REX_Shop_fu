import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface SearchState {
  query: string;
  suggestions: string[];
  history: SearchHistoryItem[];
  recentSearches: string[];
}

interface SearchContextType {
  state: SearchState;
  setQuery: (query: string) => void;
  addToHistory: (query: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
  generateSuggestions: (query: string, allProducts: any[]) => string[];
}

// Initial state
const initialState: SearchState = {
  query: '',
  suggestions: [],
  history: [],
  recentSearches: [],
};

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SearchState>(initialState);

  // Load search history from AsyncStorage
  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('searchHistory');
      const history = historyJson ? JSON.parse(historyJson) : [];
      const recentSearches = history.slice(0, 5).map((item: SearchHistoryItem) => item.query);
      setState(prev => ({ ...prev, history, recentSearches }));
    } catch (error) {
      console.error('❌ SearchContext: خطأ في تحميل سجل البحث:', error);
    }
  };

  // Add query to history
  const addToHistory = async (query: string) => {
    if (!query.trim()) return;

    try {
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp: Date.now(),
      };

      const newHistory = [newItem, ...state.history].filter(
        (item, index, self) => index === self.findIndex(t => t.query === item.query)
      ).slice(0, 20); // Keep last 20 searches

      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      const recentSearches = newHistory.slice(0, 5).map(item => item.query);
      setState(prev => ({ ...prev, history: newHistory, recentSearches }));
    } catch (error) {
      console.error('❌ SearchContext: خطأ في حفظ سجل البحث:', error);
    }
  };

  // Clear search history
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setState(prev => ({ ...prev, history: [], recentSearches: [] }));
    } catch (error) {
      console.error('❌ SearchContext: خطأ في مسح سجل البحث:', error);
    }
  };

  // Set search query
  const setQuery = (query: string) => {
    setState(prev => ({ ...prev, query }));
  };

  // Generate search suggestions based on products
  const generateSuggestions = (query: string, allProducts: any[]): string[] => {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    allProducts.forEach(product => {
      // Add product name matches
      if (product.name && product.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.name);
      }

      // Add category matches
      if (product.category && product.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.category);
      }

      // Add description matches (first few words)
      if (product.description) {
        const words = product.description.split(/\s+/);
        words.forEach((word: string) => {
          if (word.toLowerCase().includes(lowerQuery) && word.length > 2) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 10);
  };

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <SearchContext.Provider
      value={{
        state,
        setQuery,
        addToHistory,
        clearHistory,
        loadHistory,
        generateSuggestions,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  return context;
};

export default SearchContext;
