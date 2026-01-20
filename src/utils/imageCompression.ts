import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: ImageManipulator.SaveFormat;
}

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  compressionRatio: number;
}

/**
 * Compress image with specified options
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions = {}
): Promise<string> {
  try {
    const {
      quality = 0.7,
      maxWidth = 1920,
      maxHeight = 1080,
      format = ImageManipulator.SaveFormat.JPEG,
    } = options;

    // Get original image info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    
    // Prepare manipulation actions
    const actions: ImageManipulator.Action[] = [];

    // Add resize action if needed
    actions.push({
      resize: {
        width: maxWidth,
        height: maxHeight,
      },
    });

    // Compress the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format,
        base64: false,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Compress image with detailed result
 */
export async function compressImageWithDetails(
  uri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  try {
    // Get original file info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    const originalSize = originalInfo.size || 0;

    // Compress image
    const compressedUri = await compressImage(uri, options);

    // Get compressed file info
    const compressedInfo = await FileSystem.getInfoAsync(compressedUri);
    const compressedSize = compressedInfo.size || 0;

    // Get image dimensions (this would typically require a native module)
    // For now, we'll use placeholder values
    const width = 1920; // This should be actual width
    const height = 1080; // This should be actual height

    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

    return {
      uri: compressedUri,
      width,
      height,
      fileSize: compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Error compressing image with details:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Calculate optimal compression settings based on file size
 */
export function calculateOptimalCompression(fileSizeBytes: number): CompressionOptions {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB > 10) {
    return {
      quality: 0.5,
      maxWidth: 1280,
      maxHeight: 720,
    };
  } else if (fileSizeMB > 5) {
    return {
      quality: 0.6,
      maxWidth: 1600,
      maxHeight: 900,
    };
  } else if (fileSizeMB > 2) {
    return {
      quality: 0.7,
      maxWidth: 1920,
      maxHeight: 1080,
    };
  } else {
    return {
      quality: 0.8,
      maxWidth: 2048,
      maxHeight: 1536,
    };
  }
}

/**
 * Batch compress multiple images
 */
export async function batchCompressImages(
  uris: string[],
  options: CompressionOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const compressedUris: string[] = [];

  for (let i = 0; i < uris.length; i++) {
    try {
      const compressedUri = await compressImage(uris[i], options);
      compressedUris.push(compressedUri);
      
      if (onProgress) {
        onProgress(i + 1, uris.length);
      }
    } catch (error) {
      console.error(`Error compressing image ${i + 1}:`, error);
      // Add original URI if compression fails
      compressedUris.push(uris[i]);
    }
  }

  return compressedUris;
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
  uri: string,
  width: number,
  height: number,
  quality: number = 0.8
): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error('Failed to resize image');
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  uri: string,
  size: number = 200,
  quality: number = 0.6
): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: size, height: size } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}