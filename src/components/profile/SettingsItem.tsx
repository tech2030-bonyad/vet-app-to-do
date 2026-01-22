import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  type?: 'navigation' | 'switch' | 'info';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
  destructive?: boolean;
}

/**
 * Reusable settings item component that supports different types of interactions
 */
export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  iconColor = '#007AFF',
  type = 'navigation',
  value,
  onPress,
  onToggle,
  disabled = false,
  showChevron = true,
  style,
  destructive = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const handleToggle = (newValue: boolean) => {
    if (disabled) return;
    onToggle?.(newValue);
  };

  const renderRightContent = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value as boolean}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        );
      case 'info':
        return (
          <Text style={[styles.valueText, disabled && styles.disabledText]}>
            {value as string}
          </Text>
        );
      default:
        return showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={disabled ? '#C7C7CC' : '#C7C7CC'}
          />
        ) : null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled || type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
            <Ionicons name={icon} size={20} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              destructive && styles.destructiveText,
              disabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, disabled && styles.disabledText]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightContent}>{renderRightContent()}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  } as ViewStyle,
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,
  textContainer: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  } as TextStyle,
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  } as TextStyle,
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  valueText: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  } as TextStyle,
  destructiveText: {
    color: '#FF3B30',
  } as TextStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  disabledText: {
    color: '#C7C7CC',
  } as TextStyle,
});