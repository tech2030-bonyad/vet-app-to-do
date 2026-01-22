// Reusable search bar component
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
  debounceMs?: number;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products...',
  onSearch,
  onClear,
  style,
  debounceMs = 300,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, isFocused && styles.focused]}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#666" 
          style={styles.searchIcon} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
        />
        
        {query.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  } as ViewStyle,

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,

  focused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  searchIcon: {
    marginRight: 8,
  } as ViewStyle,

  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  } as TextStyle,

  clearButton: {
    marginLeft: 8,
    padding: 4,
  } as ViewStyle,
});