/**
 * Empty State Component
 * Displays when there's no content to show with optional actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { typography } from '../../styles/typography';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom icon component */
  iconComponent?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button text */
  primaryActionText?: string;
  /** Primary action callback */
  onPrimaryAction?: () => void;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Custom styles */
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  /** Icon size */
  iconSize?: number;
  /** Icon color */
  iconColor?: string;
}

/**
 * Empty state component for displaying when there's no content
 * 
 * @example
 *