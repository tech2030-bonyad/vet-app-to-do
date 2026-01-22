import fs from 'fs/promises';
import path from 'path';

/**
 * Utility functions for file operations
 */

/**
 * Ensure directory exists
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Read JSON file with error handling
 */
export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir);

    // Try to read file
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with default value
      await writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
  }
}

/**
 * Write JSON file with error handling
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir);

    // Write file with pretty formatting
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
  } catch (error: any) {
    throw new Error(`Failed to write JSON file ${filePath}: ${error.message}`);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete file if it exists
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }
}