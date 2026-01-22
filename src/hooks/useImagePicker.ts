import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { imageService, ImageAsset, ImagePickerOptions, CameraOptions } from '../services/imageService';
import { compressImage, calculateOptimalCompression } from '../utils/imageCompression';

export interface UseImagePickerOptions {
  compress?: boolean;
  compressionOptions?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  cache?: boolean;
  multiple?: boolean;
  maxSelection?: number;
}

export interface UseImagePickerReturn {
  images: ImageAsset[];
  isLoading: boolean;
  error: string | null;
  takePhoto: (options?: CameraOptions) => Promise<void>;
  pickFromLibrary: (options?: ImagePickerOptions) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  compressImages: () => Promise<void>;
  uploadProgress: number;
  isUploading: boolean;
}

export function useImagePicker(options: UseImagePickerOptions = {}): UseImagePickerReturn {
  const {
    compress = true,
    compressionOptions,
    cache = true,
    multiple = false,
    maxSelection = 5,
  } = options;

  const [images, setImages] = useState<ImageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Process and add image
   */
  const processAndAddImage = useCallback(async (asset: ImageAsset) => {
    try {
      let processedAsset = { ...asset };

      // Compress image if enabled
      if (compress && asset.fileSize) {
        const optimalCompression = compressionOptions || calculateOptimalCompression(asset.fileSize);
        const compressedUri = await compressImage(asset.uri, optimalCompression);
        processedAsset.uri = compressedUri;
      }

      // Cache image if enabled
      if (cache) {
        const cachedUri = await imageService.cacheImage(processedAsset.uri);
        processedAsset.uri = cachedUri;
      }

      return processedAsset;
    } catch (error) {
      console.error('Error processing image:', error);
      return asset; // Return original if processing fails
    }
  }, [compress, compressionOptions, cache]);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async (cameraOptions: CameraOptions = {}) => {
    try {
      setIsLoading(true);
      clearError();

      const defaultOptions: CameraOptions = {
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...cameraOptions,
      };

      const asset = await imageService.takePhoto(defaultOptions);
      
      if (asset) {
        const processedAsset = await processAndAddImage(asset);
        
        if (multiple) {
          setImages(prev => {
            const newImages = [...prev, processedAsset];
            return newImages.slice(0, maxSelection);
          });
        } else {
          setImages([processedAsset]);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to take photo';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [multiple, maxSelection, processAndAddImage, clearError]);

  /**
   * Pick images from library
   */
  const pickFromLibrary = useCallback(async (pickerOptions: ImagePickerOptions = {}) => {
    try {
      setIsLoading(true);
      clearError();

      const defaultOptions: ImagePickerOptions = {
        allowsMultipleSelection: multiple,
        selectionLimit: multiple ? maxSelection : 1,
        quality: 0.8,
        ...pickerOptions,
      };

      const assets = await imageService.pickFromLibrary(defaultOptions);
      
      if (assets.length > 0) {
        const processedAssets = await Promise.all(
          assets.map(asset => processAndAddImage(asset))
        );

        if (multiple) {
          setImages(prev => {
            const newImages = [...prev, ...processedAssets];
            return newImages.slice(0, maxSelection);
          });
        } else {
          setImages(processedAssets);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick images';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [multiple, maxSelection, processAndAddImage, clearError]);

  /**
   * Remove image by index
   */
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all images
   */
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
    setUploadProgress(0);
  }, []);

  /**
   * Compress existing images
   */
  const compressImages = useCallback(async () => {
    if (images.length === 0) return;

    try {
      setIsLoading(true);
      clearError();

      const compressedImages = await Promise.all(
        images.map(async (image) => {
          if (image.fileSize) {
            const optimalCompression = calculateOptimalCompression(image.fileSize);
            const compressedUri = await compressImage(image.uri, optimalCompression);
            return { ...image, uri: compressedUri };
          }
          return image;
        })
      );

      setImages(compressedImages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compress images';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [images, clearError]);

  /**
   * Simulate upload with progress
   */
  const simulateUpload = useCallback(async () => {
    if (images.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      await imageService.simulateUploadProgress(
        (progress) => {
          setUploadProgress(progress.percentage);
        },
        3000
      );

      Alert.alert('Success', 'Images uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images]);

  return {
    images,
    isLoading,
    error,
    takePhoto,
    pickFromLibrary,
    removeImage,
    clearImages,
    compressImages,
    uploadProgress,
    isUploading,
  };
}