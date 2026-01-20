import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserSettings, NotificationSettings, AppSettings, PrivacySettings } from '../types/profile';

interface ProfileState {
  profile: UserProfile | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

const defaultSettings: UserSettings = {
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    appUpdates: true,
    socialActivity: true,
  },
  app: {
    theme: 'system',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    autoBackup: true,
    biometricAuth: false,
    twoFactorAuth: false,
  },
  privacy: {
    profileVisibility: 'friends',
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    shareAnalytics: false,
  },
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      settings: defaultSettings,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      updateNotificationSettings: (settings) => {
        const currentSettings = get().settings;
        set({
          settings: {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              ...settings,
            },
          },
        });
      },

      updateAppSettings: (settings) => {
        const currentSettings = get().settings;
        set({
          settings: {
            ...currentSettings,
            app: {
              ...currentSettings.app,
              ...settings,
            },
          },
        });
      },

      updatePrivacySettings: (settings) => {
        const currentSettings = get().settings;
        set({
          settings: {
            ...currentSettings,
            privacy: {
              ...currentSettings.privacy,
              ...settings,
            },
          },
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearProfile: () => set({ profile: null, settings: defaultSettings }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);