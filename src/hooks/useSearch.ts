import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SearchableItem,
  SearchFilters,
  SearchState,
  Pet,
  Appointment,
  Prescription,
  Product
} from '../types/search';
import {
  debounce,
  calculateRelevanceScore,
  applyFilters,
  generateSuggestions,
  addToSearchHistory
} from '../utils/searchUtils';

/**
 * Search store for managing global search state
 */
interface SearchStore {
  searchHistory: string[];
  recentSearches: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      recentSearches: [],
      
      addToHistory: (query: string) => {
        const currentHistory = get().searchHistory;
        const newHistory = addToSearchHistory(query, currentHistory);
        set({ 
          searchHistory: newHistory,
          recentSearches: newHistory.slice(0, 5)
        });
      },
      
      clearHistory: () => {
        set({ searchHistory: [], recentSearches: [] });
      }
    }),
    {
      name: 'search-storage'
    }
  )
);

/**
 * Mock API functions - replace with actual API calls
 */
const fetchAllSearchableItems = async (): Promise<SearchableItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data - replace with actual API call
  const mockData: SearchableItem[] = [
    {
      id: '1',
      type: 'pet',
      title: 'Buddy',
      subtitle: 'Golden Retriever',
      description: 'Friendly 3-year-old dog',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      metadata: { species: 'dog', breed: 'Golden Retriever', age: 3 }
    } as Pet,
    {
      id: '2',
      type: 'appointment',
      title: 'Vaccination Appointment',
      subtitle: 'Buddy - Dr. Smith',
      description: 'Annual vaccination for Buddy',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      metadata: { status: 'scheduled', date: new Date('2024-02-01') }
    } as Appointment
    // Add more mock data as needed
  ];
  
  return mockData;
};

const searchItems = async (query: string, filters: SearchFilters): Promise<SearchableItem[]> => {
  const allItems = await fetchAllSearchableItems();
  
  // Apply text search
  let filteredItems = allItems;
  if (query.trim()) {
    filteredItems = allItems
      .map(item => ({
        ...item,
        relevanceScore: calculateRelevanceScore(item, query)
      }))
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  // Apply filters
  filteredItems = applyFilters(filteredItems, filters);
  
  return filteredItems;
};

/**
 * Main search hook
 */
export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    status: [],
    species: [],
    categories: [],
    veterinarians: []
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { searchHistory, addToHistory, clearHistory } = useSearchStore();
  
  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  const debouncedSetQuery = useCallback(
    debounce((newQuery: string) => {
      setDebouncedQuery(newQuery);
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);
  
  // Search results query
  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: () => searchItems(debouncedQuery, filters),
    enabled: isSearchActive && (debouncedQuery.length > 0 || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  
  // All items query for suggestions
  const { data: allItems = [] } = useQuery({
    queryKey: ['allSearchableItems'],
    queryFn: fetchAllSearchableItems,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  // Generate suggestions
  useEffect(() => {
    const newSuggestions = generateSuggestions(query, searchHistory, allItems);
    setSuggestions(newSuggestions);
  }, [query, searchHistory, allItems]);
  
  // Search actions
  const performSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearchActive(true);
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
    }
  }, [addToHistory]);
  
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearchActive(false);
    setFilters({
      types: [],
      status: [],
      species: [],
      categories: [],
      veterinarians: []
    });
  }, []);
  
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setIsSearchActive(true);
  }, []);
  
  const removeFilter = useCallback((filterType: keyof SearchFilters, value?: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (Array.isArray(newFilters[filterType])) {
        if (value !== undefined) {
          (newFilters[filterType] as any[]) = (newFilters[filterType] as any[]).filter(
            item => item !== value
          );
        } else {
          (newFilters[filterType] as any[]) = [];
        }
      } else {
        (newFilters as any)[filterType] = undefined;
      }
      
      return newFilters;
    });
  }, []);
  
  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : !!filter
    );
  }, [filters]);
  
  const searchState: SearchState = {
    query,
    filters,
    results: searchResults,
    isLoading,
    error: error?.message || null,
    history: searchHistory,
    suggestions
  };
  
  return {
    // State
    searchState,
    isSearchActive,
    hasActiveFilters,
    
    // Actions
    setQuery,
    performSearch,
    clearSearch,
    updateFilters,
    removeFilter,
    clearHistory,
    refetch,
    
    // Suggestions
    suggestions,
    
    // Utils
    setIsSearchActive
  };
};

/**
 * Hook for type-specific search (e.g., only pets, only appointments)
 */
export const useTypeSpecificSearch = (type: SearchableItem['type']) => {
  const searchHook = useSearch();
  
  useEffect(() => {
    searchHook.updateFilters({ types: [type] });
  }, [type]);
  
  return {
    ...searchHook,
    searchResults: searchHook.searchState.results.filter(item => item.type === type)
  };
};

/**
 * Hook for recent searches
 */
export const useRecentSearches = () => {
  const { searchHistory } = useSearchStore();
  
  return {
    recentSearches: searchHistory.slice(0, 5),
    allHistory: searchHistory
  };
};