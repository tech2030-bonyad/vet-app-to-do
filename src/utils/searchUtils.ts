import { SearchableItem, SearchFilters, SearchHighlight } from '../types/search';

/**
 * Utility functions for search functionality
 */

/**
 * Debounce function to limit API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Normalize text for search comparison
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Calculate search relevance score
 */
export const calculateRelevanceScore = (
  item: SearchableItem,
  query: string
): number => {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  
  if (queryWords.length === 0) return 0;
  
  let score = 0;
  const titleWeight = 3;
  const subtitleWeight = 2;
  const descriptionWeight = 1;
  
  // Check title matches
  const normalizedTitle = normalizeText(item.title);
  queryWords.forEach(word => {
    if (normalizedTitle.includes(word)) {
      score += titleWeight;
      // Bonus for exact word match
      if (normalizedTitle.split(' ').includes(word)) {
        score += titleWeight * 0.5;
      }
    }
  });
  
  // Check subtitle matches
  if (item.subtitle) {
    const normalizedSubtitle = normalizeText(item.subtitle);
    queryWords.forEach(word => {
      if (normalizedSubtitle.includes(word)) {
        score += subtitleWeight;
      }
    });
  }
  
  // Check description matches
  if (item.description) {
    const normalizedDescription = normalizeText(item.description);
    queryWords.forEach(word => {
      if (normalizedDescription.includes(word)) {
        score += descriptionWeight;
      }
    });
  }
  
  // Bonus for recent items
  const daysSinceUpdate = Math.floor(
    (Date.now() - item.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate < 7) {
    score += 0.5;
  }
  
  return score;
};

/**
 * Filter items based on search filters
 */
export const applyFilters = (
  items: SearchableItem[],
  filters: SearchFilters
): SearchableItem[] => {
  return items.filter(item => {
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(item.type)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const itemDate = new Date(item.createdAt);
      if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      const itemStatus = (item as any).status;
      if (!itemStatus || !filters.status.includes(itemStatus)) {
        return false;
      }
    }
    
    // Price range filter (for products)
    if (filters.priceRange && item.type === 'product') {
      const product = item as any;
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      ) {
        return false;
      }
    }
    
    // Species filter (for pets)
    if (filters.species && filters.species.length > 0 && item.type === 'pet') {
      const pet = item as any;
      if (!filters.species.includes(pet.species)) {
        return false;
      }
    }
    
    // Category filter (for products)
    if (filters.categories && filters.categories.length > 0 && item.type === 'product') {
      const product = item as any;
      if (!filters.categories.includes(product.category)) {
        return false;
      }
    }
    
    // Veterinarian filter (for appointments and prescriptions)
    if (filters.veterinarians && filters.veterinarians.length > 0) {
      if (item.type === 'appointment' || item.type === 'prescription') {
        const itemWithVet = item as any;
        if (!filters.veterinarians.includes(itemWithVet.veterinarianId)) {
          return false;
        }
      }
    }
    
    return true;
  });
};

/**
 * Highlight search terms in text
 */
export const highlightSearchTerms = (
  text: string,
  query: string
): SearchHighlight[] => {
  if (!query.trim()) {
    return [{ text, isHighlighted: false }];
  }
  
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  
  if (queryWords.length === 0) {
    return [{ text, isHighlighted: false }];
  }
  
  let result: SearchHighlight[] = [];
  let currentIndex = 0;
  const normalizedText = normalizeText(text);
  
  // Find all matches
  const matches: Array<{ start: number; end: number; word: string }> = [];
  
  queryWords.forEach(word => {
    let searchIndex = 0;
    while (true) {
      const index = normalizedText.indexOf(word, searchIndex);
      if (index === -1) break;
      
      matches.push({
        start: index,
        end: index + word.length,
        word
      });
      
      searchIndex = index + 1;
    }
  });
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Merge overlapping matches
  const mergedMatches: Array<{ start: number; end: number }> = [];
  matches.forEach(match => {
    const lastMerged = mergedMatches[mergedMatches.length - 1];
    if (lastMerged && match.start <= lastMerged.end) {
      lastMerged.end = Math.max(lastMerged.end, match.end);
    } else {
      mergedMatches.push({ start: match.start, end: match.end });
    }
  });
  
  // Build result with highlights
  mergedMatches.forEach(match => {
    // Add non-highlighted text before match
    if (currentIndex < match.start) {
      const beforeText = text.slice(currentIndex, match.start);
      if (beforeText) {
        result.push({ text: beforeText, isHighlighted: false });
      }
    }
    
    // Add highlighted text
    const highlightedText = text.slice(match.start, match.end);
    result.push({ text: highlightedText, isHighlighted: true });
    
    currentIndex = match.end;
  });
  
  // Add remaining non-highlighted text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    result.push({ text: remainingText, isHighlighted: false });
  }
  
  return result.length > 0 ? result : [{ text, isHighlighted: false }];
};

/**
 * Generate search suggestions based on query and history
 */
export const generateSuggestions = (
  query: string,
  history: string[],
  items: SearchableItem[]
): string[] => {
  const suggestions = new Set<string>();
  const normalizedQuery = normalizeText(query);
  
  if (normalizedQuery.length === 0) {
    // Return recent history if no query
    return history.slice(0, 5);
  }
  
  // Add matching history items
  history.forEach(historyItem => {
    const normalizedHistory = normalizeText(historyItem);
    if (normalizedHistory.includes(normalizedQuery)) {
      suggestions.add(historyItem);
    }
  });
  
  // Add matching item titles
  items.forEach(item => {
    const normalizedTitle = normalizeText(item.title);
    if (normalizedTitle.includes(normalizedQuery)) {
      suggestions.add(item.title);
    }
    
    // Add matching subtitles
    if (item.subtitle) {
      const normalizedSubtitle = normalizeText(item.subtitle);
      if (normalizedSubtitle.includes(normalizedQuery)) {
        suggestions.add(item.subtitle);
      }
    }
  });
  
  return Array.from(suggestions).slice(0, 8);
};

/**
 * Save search query to history
 */
export const addToSearchHistory = (
  query: string,
  currentHistory: string[]
): string[] => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery || trimmedQuery.length < 2) {
    return currentHistory;
  }
  
  // Remove existing occurrence
  const filteredHistory = currentHistory.filter(
    item => normalizeText(item) !== normalizeText(trimmedQuery)
  );
  
  // Add to beginning and limit to 20 items
  return [trimmedQuery, ...filteredHistory].slice(0, 20);
};