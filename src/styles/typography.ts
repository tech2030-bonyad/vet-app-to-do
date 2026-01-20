/**
 * Typography System
 * Defines font sizes, weights, and line heights for consistent text styling
 */

import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Predefined text styles
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 43.2,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 28.8,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 21.6,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 19.2,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 22.4,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 19.6,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 16.8,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 19.2,
    },
    overline: {
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 14.4,
      textTransform: 'uppercase' as TextStyle['textTransform'],
      letterSpacing: 0.5,
    },
  },
} as const;

export type Typography = typeof typography;
export type TypographyStyles = keyof typeof typography.styles;