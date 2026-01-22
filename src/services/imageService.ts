import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { compressImage } from '../utils/imageCompression';

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileSize?: number;
  fileName?: string;
  base64?: string;
}

export interface ImagePickerOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
  base64?: boolean;
  exif?: boolean;
}

export interface CameraOptions extends ImagePickerOptions {
  cameraType?: ImagePicker.CameraType;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class ImageService {
  private cache = new Map<string, string>();
  private readonly CACHE_DIR = `${FileSystem.cacheDirectory}images/`;

  constructor() {
    this.initializeCacheDirectory();
  }

  /**
   * Initialize cache directory
   */
  private async initializeCacheDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Media Library Permission Required',
          'Please enable media library access in your device settings to select photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(options: CameraOptions = {}): Promise<ImageAsset | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
        ...options,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return this.processImageAsset(asset);
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error('Failed to take photo');
    }
  }

  /**
   * Pick image from library
   */
  async pickFromLibrary(options: ImagePickerOptions = {}): Promise<ImageAsset[]> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) return [];

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        base64: false,
        exif: false,
        ...options,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      const processedAssets = await Promise.all(
        result.assets.map(asset => this.processImageAsset(asset))
      );

      return processedAssets.filter(Boolean) as ImageAsset[];
    } catch (error) {
      console.error('Error picking from library:', error);
      throw new Error('Failed to pick image from library');
    }
  }

  /**
   * Process image asset
   */
  private async processImageAsset(asset: ImagePicker.ImagePickerAsset): Promise<ImageAsset> {
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: asset.type,
      fileSize: fileInfo.size,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      base64: asset.base64,
    };
  }

  /**
   * Compress image
   */
  async compressImage(
    imageUri: string,
    options: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
    } = {}
  ): Promise<string> {
    try {
      return await compressImage(imageUri, options);
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Cache image locally
   */
  async cacheImage(uri: string, cacheKey?: string): Promise<string> {
    try {
      const key = cacheKey || this.generateCacheKey(uri);
      
      // Check if already cached
      if (this.cache.has(key)) {
        const cachedUri = this.cache.get(key)!;
        const fileInfo = await FileSystem.getInfoAsync(cachedUri);
        if (fileInfo.exists) {
          return cachedUri;
        }
      }

      // Download and cache
      const fileName = `${key}.jpg`;
      const localUri = `${this.CACHE_DIR}${fileName}`;
      
      await FileSystem.downloadAsync(uri, localUri);
      this.cache.set(key, localUri);
      
      return localUri;
    } catch (error) {
      console.error('Error caching image:', error);
      return uri; // Return original URI if caching fails
    }
  }

  /**
   * Get cached image
   */
  getCachedImage(cacheKey: string): string | null {
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Clear image cache
   */
  async clearCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
        await this.initializeCacheDirectory();
      }
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Save image to device gallery
   */
  async saveToGallery(uri: string): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to save images.');
        return false;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  /**
   * Get image info
   */
  async getImageInfo(uri: string): Promise<{
    width: number;
    height: number;
    size?: number;
  }> {
    try {
      const [imageInfo, fileInfo] = await Promise.all([
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          // This would typically use a native module or Image.getSize
          // For now, we'll use a placeholder implementation
          resolve({ width: 0, height: 0 });
        }),
        FileSystem.getInfoAsync(uri)
      ]);

      return {
        width: imageInfo.width,
        height: imageInfo.height,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      throw new Error('Failed to get image information');
    }
  }

  /**
   * Generate cache key from URI
   */
  private generateCacheKey(uri: string): string {
    return uri.split('/').pop()?.split('.')[0] || `image_${Date.now()}`;
  }

  /**
   * Simulate upload progress
   */
  simulateUploadProgress(
    onProgress: (progress: UploadProgress) => void,
    duration: number = 3000
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / duration) * 100, 100);
        
        onProgress({
          loaded: elapsed,
          total: duration,
          percentage: Math.round(percentage),
        });

        if (percentage >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
}

export const imageService = new ImageService();