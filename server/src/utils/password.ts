/**
 * Password utility functions for hashing and verification
 * Uses bcryptjs for secure password handling
 */

import bcrypt from 'bcryptjs';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain text password
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a plain text password against a hashed password
   * @param password - Plain text password to verify
   * @param hashedPassword - Hashed password to compare against
   * @returns Promise<boolean> - True if passwords match
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns object with validation result and message
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }

    return { isValid: true, message: 'Password is strong' };
  }
}