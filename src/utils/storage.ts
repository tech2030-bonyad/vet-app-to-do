import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility for handling AsyncStorage operations with error handling
 * Provides a consistent interface for storing and retrieving data
 */

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  version: string;
}

class StorageManager {
  private readonly version = '1.0.0';

  /**
   * Store data in AsyncStorage with metadata
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: this.version,
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error storing item with key ${key}:`, error);
      throw new Error(`Failed to store ${key}`);
    }
  }

  /**
   * Retrieve data from AsyncStorage with validation
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const parsedItem: StorageItem<T> = JSON.parse(item);
      
      // Version check for data migration if needed
      if (parsedItem.version !== this.version) {
        console.warn(`Version mismatch for ${key}. Expected: ${this.version}, Got: ${parsedItem.version}`);
      }

      return parsedItem.value;
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Check if item exists in storage
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item !== null;
    } catch (error) {
      console.error(`Error checking existence of ${key}:`, error);
      return false;
    }
  }
}

export const storage = new StorageManager();

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_STATE: '@pet_app/auth_state',
  PET_STATE: '@pet_app/pet_state',
  CART_STATE: '@pet_app/cart_state',
  APPOINTMENT_STATE: '@pet_app/appointment_state',
  USER_PREFERENCES: '@pet_app/user_preferences',
} as const;