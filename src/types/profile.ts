// Profile and settings type definitions
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  appUpdates: boolean;
  socialActivity: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  autoBackup: boolean;
  biometricAuth: boolean;
  twoFactorAuth: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
  shareAnalytics: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  app: AppSettings;
  privacy: PrivacySettings;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  dateOfBirth: string;
  location: string;
}