import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import NavigationGuard from './NavigationGuard';

/**
 * Stack navigator component
 * Handles screen transitions and navigation flow
 */
export default function StackNavigator() {
  const { isAuthenticated } = useAuthStore();

  // Common screen options
  const defaultScreenOptions = {
    headerStyle: {
      backgroundColor: '#FFFFFF',
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5EA',
    },
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: '#000000',
    },
    headerTintColor: '#007AFF',
    headerBackTitleVisible: false,
    animation: 'slide_from_right' as const,
  };

  return (
    <NavigationGuard>
      <Stack
        screenOptions={defaultScreenOptions}
      >
        {/* Authentication Screens */}
        <Stack.Screen
          name="auth/login"
          options={{
            title: 'Sign In',
            headerShown: !isAuthenticated,
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="auth/register"
          options={{
            title: 'Create Account',
            headerShown: !isAuthenticated,
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            title: 'Reset Password',
            headerShown: !isAuthenticated,
            presentation: 'modal',
          }}
        />

        {/* Onboarding Screens */}
        <Stack.Screen
          name="onboarding/welcome"
          options={{
            title: 'Welcome',
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        
        <Stack.Screen
          name="onboarding/pet-setup"
          options={{
            title: 'Add Your Pet',
            headerBackVisible: false,
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Pet Management Screens */}
        <Stack.Screen
          name="pets/add-pet"
          options={{
            title: 'Add New Pet',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="pets/edit-pet/[id]"
          options={{
            title: 'Edit Pet',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="pets/pet-profile/[id]"
          options={{
            title: 'Pet Profile',
          }}
        />

        {/* Health Screens */}
        <Stack.Screen
          name="health/add-record"
          options={{
            title: 'Add Health Record',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="health/record-details/[id]"
          options={{
            title: 'Health Record',
          }}
        />
        
        <Stack.Screen
          name="health/vaccination-schedule"
          options={{
            title: 'Vaccination Schedule',
          }}
        />

        {/* Activity Screens */}
        <Stack.Screen
          name="activities/add-activity"
          options={{
            title: 'Log Activity',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="activities/activity-details/[id]"
          options={{
            title: 'Activity Details',
          }}
        />

        {/* Care Screens */}
        <Stack.Screen
          name="care/add-reminder"
          options={{
            title: 'Add Reminder',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="care/reminder-details/[id]"
          options={{
            title: 'Reminder Details',
          }}
        />

        {/* Settings Screens */}
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
          }}
        />
        
        <Stack.Screen
          name="settings/notifications"
          options={{
            title: 'Notifications',
          }}
        />
        
        <Stack.Screen
          name="settings/privacy"
          options={{
            title: 'Privacy & Security',
          }}
        />
        
        <Stack.Screen
          name="settings/support"
          options={{
            title: 'Help & Support',
          }}
        />

        {/* Catch-all for 404 */}
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Page Not Found',
          }}
        />
      </Stack>
    </NavigationGuard>
  );
}