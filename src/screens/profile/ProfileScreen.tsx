import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../stores/profileStore';
import { SettingsItem } from '../../components/profile/SettingsItem';

/**
 * Main profile screen displaying user information and navigation to various profile-related screens
 */
export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { profile, clearProfile } = useProfileStore();

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/profile/settings');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            clearProfile();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-circle-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No profile data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(profile.firstName, profile.lastName)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            {profile.bio && (
              <Text style={styles.profileBio}>{profile.bio}</Text>
            )}
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(profile.createdAt)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              title="Personal Information"
              description="Name, email, phone, and other details"
              icon="person-outline"
              onPress={handleEditProfile}
            />
            <SettingsItem
              title="Location"
              description={profile.location || 'Not specified'}
              icon="location-outline"
              type="info"
              value={profile.location || 'Add location'}
              onPress={handleEditProfile}
            />
            {profile.phone && (
              <SettingsItem
                title="Phone"
                description="Your phone number"
                icon="call-outline"
                type="info"
                value={profile.phone}
                showChevron={false}
              />
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              title="Settings"
              description="App preferences and notifications"
              icon="settings-outline"
              onPress={handleSettings}
            />
            <SettingsItem
              title="Privacy & Security"
              description="Manage your privacy settings"
              icon="shield-outline"
              onPress={() => router.push('/profile/privacy')}
            />
            <SettingsItem
              title="Help & Support"
              description="Get help and contact support"
              icon="help-circle-outline"
              onPress={() => router.push('/support')}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingsItem
              title="Sign Out"
              icon="log-out-outline"
              iconColor="#FF3B30"
              destructive
              showChevron={false}
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
  } as ViewStyle,
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  } as TextStyle,
  settingsButton: {
    padding: 8,
  } as ViewStyle,
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  } as ViewStyle,
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  } as ViewStyle,
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  } as TextStyle,
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  } as ViewStyle,
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  } as TextStyle,
  profileEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  } as TextStyle,
  profileBio: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  } as TextStyle,
  joinDate: {
    fontSize: 12,
    color: '#C7C7CC',
  } as TextStyle,
  editProfileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  } as ViewStyle,
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  section: {
    marginBottom: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginHorizontal: 16,
    marginBottom: 8,
  } as TextStyle,
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  } as ViewStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  } as ViewStyle,
  emptyStateText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,
  bottomSpacing: {
    height: 40,
  } as ViewStyle,
});