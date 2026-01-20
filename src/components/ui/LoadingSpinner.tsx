/**
 * Loading Spinner Component
 * Animated loading indicator with customizable size and color
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Color of the spinner */
  color?: string;
  /** Whether to show the spinner */
  visible?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Animation duration in milliseconds */
  duration?: number;
}

/**
 * Loading spinner component with smooth rotation animation
 * 
 * @example
 *