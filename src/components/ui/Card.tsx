/**
 * Card Component
 * A flexible container component with consistent styling and shadow
 */

import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../styles/theme';

export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Card content */
  children: React.ReactNode;
  /** Card variant for different visual styles */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether the card is pressable */
  pressable?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Whether to show shadow */
  shadow?: boolean;
  /** Border radius size */
  borderRadius?: 'sm' | 'md' | 'lg';
}

/**
 * Card component for displaying content in a contained, elevated surface
 * 
 * @example
 *