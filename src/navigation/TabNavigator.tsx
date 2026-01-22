import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { usePetStore } from '../stores/petStore';
import Header from '../components/navigation/Header';

/**
 * Bottom tab navigator component
 * Handles main app navigation with authentication guards
 */
export default function TabNavigator() {
  const { isAuthenticated } = useAuthStore();
  const { activePet } = usePetStore();

  // Tab bar icon renderer
  const renderTabBarIcon = (name: keyof typeof Ionicons.glyphMap, focused: boolean) => {
    return (
      <Ionicons
        name={name}
        size={24}
        color={focused ? '#007AFF' : '#8E8E93'}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: true,
        header: () => <Header />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => renderTabBarIcon('home', focused),
          href: isAuthenticated ? '/dashboard' : null,
        }}
      />
      
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ focused }) => renderTabBarIcon('medical', focused),
          href: isAuthenticated && activePet ? '/health' : null,
          tabBarBadge: activePet?.healthAlerts > 0 ? activePet.healthAlerts : undefined,
        }}
      />
      
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ focused }) => renderTabBarIcon('walk', focused),
          href: isAuthenticated && activePet ? '/activities' : null,
        }}
      />
      
      <Tabs.Screen
        name="care"
        options={{
          title: 'Care',
          tabBarIcon: ({ focused }) => renderTabBarIcon('heart', focused),
          href: isAuthenticated && activePet ? '/care' : null,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => renderTabBarIcon('person', focused),
          href: isAuthenticated ? '/profile' : null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 90 : 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});