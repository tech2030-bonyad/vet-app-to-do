import { apiClient, ApiResponse } from './api';

// Auth-related types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'vet';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface VerifyEmailData {
  token: string;
}

export interface VerifyPhoneData {
  phone: string;
  code: string;
}

export interface ResendVerificationData {
  type: 'email' | 'phone';
  email?: string;
  phone?: string;
}

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */
export class AuthApiService {
  /**
   * User login
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store auth tokens
      if (response.success && response.data.tokens) {
        apiClient.setAuthToken(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User registration
   */
  static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      // Store auth tokens if registration includes auto-login
      if (response.success && response.data.tokens) {
        apiClient.setAuthToken(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User logout
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/auth/logout');
      
      // Clear stored tokens
      apiClient.clearAuthToken();
      
      return response;
    } catch (error) {
      // Clear tokens even if logout request fails
      apiClient.clearAuthToken();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      return await apiClient.post<AuthTokens>('/auth/refresh');
    } catch (error) {
      // Clear tokens if refresh fails
      apiClient.clearAuthToken();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiClient.get<User>('/auth/me');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      return await apiClient.patch<User>('/auth/profile', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/change-password', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/forgot-password', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/reset-password', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(data: VerifyEmailData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/verify-email', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify phone number
   */
  static async verifyPhone(data: VerifyPhoneData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/verify-phone', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend verification code
   */
  static async resendVerification(data: ResendVerificationData): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/resend-verification', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(password: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>('/auth/account', {
        body: JSON.stringify({ password }),
      });
      
      // Clear tokens after account deletion
      apiClient.clearAuthToken();
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email is available
   */
  static async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      return await apiClient.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }>>> {
    try {
      return await apiClient.get('/auth/sessions');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke user session
   */
  static async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`/auth/sessions/${sessionId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revoke all other sessions
   */
  static async revokeAllOtherSessions(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/revoke-all-sessions');
    } catch (error) {
      throw error;
    }
  }
}

export default AuthApiService;