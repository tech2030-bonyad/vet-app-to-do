import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { usePetStore } from '../../stores/petStore';
import PetSwitcher from './PetSwitcher';

/**
 * Main header component
 * Displays navigation title, pet switcher, and action buttons
 */
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { activePet } = usePetStore();

  /**
   * Get header title based on current route
   */
  const getHeaderTitle = (): string => {
    const routeMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/health': 'Health',
      '/activities': 'Activities',
      '/care': 'Care',
      '/profile': 'Profile',
    };

    return routeMap[pathname] || 'PetCare';
  };

  /**
   * Check if pet switcher should be shown
   */
  const shouldShowPetSwitcher = (): boolean => {
    const petRequiredRoutes = ['/health', '/activities', '/care'];
    return petRequiredRoutes.includes(pathname) && !!activePet;
  };

  /**
   * Handle notifications button press
   */
  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  /**
   * Handle settings button press
   */
  const handleSettingsPress = () => {
    router.push('/settings');
  };

  /**
   * Handle add button press based on current route
   */
  const handleAddPress = () => {
    const addRouteMap: Record<string, string> = {
      '/health': '/health/add-record',
      '/activities': '/activities/add-activity',
      '/care': '/care/add-reminder',
    };

    const route = addRouteMap[pathname];
    if (route) {
      router.push(route);
    }
  };

  /**
   * Check if add button should be shown
   */
  const shouldShowAddButton = (): boolean => {
    const addableRoutes = ['/health', '/activities', '/care'];
    return addableRoutes.includes(pathname) && !!activePet;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{getHeaderTitle()}</Text>
          {shouldShowPetSwitcher() && (
            <View style={styles.petSwitcherContainer}>
              <PetSwitcher />
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          {shouldShowAddButton() && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddPress}
              accessibilityLabel="Add new item"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNotificationsPress}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSettingsPress}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  petSwitcherContainer: {
    marginTop: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});