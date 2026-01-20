import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '../../hooks/useSearch';
import { SearchableItem } from '../../types/search';

interface GlobalSearchProps {
  placeholder?: string;
  onItemSelect?: (item: SearchableItem) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

/**
 * Global search component with suggestions and history
 */
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search pets, appointments, prescriptions...',
  onItemSelect,
  onFocus,
  onBlur,
  style,
  showSuggestions = true,
  autoFocus = false
}) => {
  const {
    searchState,
    setQuery,
    performSearch,
    clearSearch,
    suggestions,
    setIsSearchActive
  } = useSearch();
  
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const suggestionHeight = useRef(new Animated.Value(0)).current;
  
  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setIsSearchActive(true);
    setShowSuggestionsList(true);
    onFocus?.();
    
    // Animate suggestions appearance
    Animated.timing(suggestionHeight, {
      toValue: Math.min(suggestions.length * 50, 200),
      duration: 200,
      useNativeDriver: false
    }).start();
  };
  
  // Handle input blur
  const handleBlur = () => {
    // Delay to allow suggestion selection
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestionsList(false);
      onBlur?.();
      
      // Animate suggestions disappearance
      Animated.timing(suggestionHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }, 150);
  };
  
  // Handle search input change
  const handleChangeText = (text: string) => {
    setQuery(text);
  };
  
  // Handle search submission
  const handleSubmitEditing = () => {
    if (searchState.query.trim()) {
      performSearch(searchState.query);
      Keyboard.dismiss();
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestionsList(false);
    Keyboard.dismiss();
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    clearSearch();
    inputRef.current?.focus();
  };
  
  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);
  
  // Update suggestion height when suggestions change
  useEffect(() => {
    if (showSuggestionsList) {
      Animated.timing(suggestionHeight, {
        toValue: Math.min(suggestions.length * 50, 200),
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  }, [suggestions.length, showSuggestionsList]);
  
  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="search" 
        size={16} 
        color="#666" 
        style={styles.suggestionIcon} 
      />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item}
      </Text>
      <Ionicons 
        name="arrow-up-outline" 
        size={16} 
        color="#666" 
        style={styles.suggestionArrow} 
      />
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, style]}>
      {/* Search Input */}
      <View style={[
        styles.searchInputContainer,
        isFocused && styles.searchInputContainerFocused
      ]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? '#007AFF' : '#666'} 
          style={styles.searchIcon} 
        />
        
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchState.query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
        />
        
        {searchState.query.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        
        {searchState.isLoading && (
          <View style={styles.loadingIndicator}>
            <Ionicons name="hourglass" size={16} color="#007AFF" />
          </View>
        )}
      </View>
      
      {/* Suggestions List */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            { height: suggestionHeight }
          ]}
        >
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => `suggestion-${index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000
  },
  
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  
  searchInputContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  searchIcon: {
    marginRight: 8
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0
  },
  
  clearButton: {
    marginLeft: 8,
    padding: 2
  },
  
  loadingIndicator: {
    marginLeft: 8
  },
  
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden'
  },
  
  suggestionsList: {
    flex: 1
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5'
  },
  
  suggestionIcon: {
    marginRight: 12
  },
  
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  
  suggestionArrow: {
    marginLeft: 8,
    opacity: 0.5
  }
});