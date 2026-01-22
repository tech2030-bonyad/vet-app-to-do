/**
 * Modal Component
 * A customizable modal dialog with backdrop and animations
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  BackHandler,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { typography } from '../../styles/typography';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Function called when modal should be closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether modal can be closed by tapping backdrop */
  closeOnBackdropPress?: boolean;
  /** Whether modal can be closed by back button (Android) */
  closeOnBackButton?: boolean;
  /** Animation type */
  animationType?: 'slide' | 'fade' | 'none';
  /** Custom styles */
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

/**
 * Modal component for displaying content in an overlay
 * 
 * @example
 *