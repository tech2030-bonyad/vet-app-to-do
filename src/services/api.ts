import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

// Base API configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.petcare.com';
export const API_VERSION = 'v1';
export const API_TIMEOUT = 10000;

// Storage keys for offline data
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@petcare_auth_token',
  REFRESH_TOKEN: '@petcare_refresh_token',
  USER_DATA: '@petcare_user_data',
  OFFLINE_QUEUE: '@petcare_offline_queue',
  CACHED_DATA: '@petcare_cached_data',
} as const;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Network status interface
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

// Offline queue item interface
export interface OfflineQueueItem {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Enhanced API client with offline support and error handling
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.baseURL = `${API_BASE_URL}/${API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    this.initializeTokens();
  }

  /**
   * Initialize auth tokens from storage
   */
  private async initializeTokens(): Promise<void> {
    try {
      const [authToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);
      
      this.authToken = authToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
    }
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string, refresh?: string): void {
    this.authToken = token;
    if (refresh) {
      this.refreshToken = refresh;
    }
    
    // Store tokens
    AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      ...(refresh ? [[STORAGE_KEYS.REFRESH_TOKEN, refresh]] : []),
    ]);
  }

  /**
   * Clear authentication tokens
   */
  public clearAuthToken(): void {
    this.authToken = null;
    this.refreshToken = null;
    AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Handle token refresh
   */
  private async refreshAuthToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const { accessToken, refreshToken } = response.data;
      this.setAuthToken(accessToken, refreshToken);

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
      this.failedQueue = [];

      return accessToken;
    } catch (error) {
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      this.clearAuthToken();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkStatus(): Promise<NetworkStatus> {
    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected ?? false,
      isInternetReachable: netInfo.isInternetReachable ?? false,
      type: netInfo.type,
    };
  }

  /**
   * Add request to offline queue
   */
  private async addToOfflineQueue(
    url: string,
    options: RequestInit,
    maxRetries = 3
  ): Promise<void> {
    const queueItem: OfflineQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      method: (options.method as any) || 'GET',
      data: options.body ? JSON.parse(options.body as string) : undefined,
      headers: options.headers as Record<string, string>,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    try {
      const existingQueue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      const queue: OfflineQueueItem[] = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(queueItem);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  }

  /**
   * Process offline queue when connection is restored
   */
  public async processOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (!queueData) return;

      const queue: OfflineQueueItem[] = JSON.parse(queueData);
      const processedItems: string[] = [];

      for (const item of queue) {
        try {
          await this.makeRequest(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.data ? JSON.stringify(item.data) : undefined,
          });
          processedItems.push(item.id);
        } catch (error) {
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            processedItems.push(item.id);
            console.error(`Failed to process offline queue item after ${item.maxRetries} retries:`, error);
          }
        }
      }

      // Remove processed items from queue
      const remainingQueue = queue.filter(item => !processedItems.includes(item.id));
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }

  /**
   * Cache data for offline access
   */
  private async cacheData(key: string, data: any): Promise<void> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_DATA}_${key}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData(key: string, maxAge = 24 * 60 * 60 * 1000): Promise<any> {
    try {
      const cacheKey = `${STORAGE_KEYS.CACHED_DATA}_${key}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > maxAge;

      return isExpired ? null : data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Make HTTP request with retry logic and offline support
   */
  private async makeRequest(
    url: string,
    options: RequestInit = {},
    retryCount = 0,
    maxRetries = 3
  ): Promise<ApiResponse> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const networkStatus = await this.checkNetworkStatus();

    // Handle offline scenario
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      // For GET requests, try to return cached data
      if (!options.method || options.method === 'GET') {
        const cachedData = await this.getCachedData(url);
        if (cachedData) {
          return { success: true, data: cachedData };
        }
      }

      // For other methods, add to offline queue
      if (options.method && options.method !== 'GET') {
        await this.addToOfflineQueue(url, options);
      }

      throw new ApiError({
        message: 'No internet connection. Request will be processed when connection is restored.',
        status: 0,
        code: 'OFFLINE',
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(fullUrl, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token expiration
      if (response.status === 401 && this.authToken && !url.includes('/auth/')) {
        try {
          await this.refreshAuthToken();
          // Retry the original request with new token
          return this.makeRequest(url, options, retryCount, maxRetries);
        } catch (refreshError) {
          throw new ApiError({
            message: 'Authentication failed. Please log in again.',
            status: 401,
            code: 'AUTH_FAILED',
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError({
          message: data.message || `HTTP ${response.status}`,
          status: response.status,
          code: data.code,
          details: data.errors,
        });
      }

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        await this.cacheData(url, data);
      }

      return data;
    } catch (error) {
      // Handle network errors with retry logic
      if (error.name === 'AbortError') {
        throw new ApiError({
          message: 'Request timeout',
          status: 408,
          code: 'TIMEOUT',
        });
      }

      if (retryCount < maxRetries && this.shouldRetry(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, options, retryCount + 1, maxRetries);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        message: error.message || 'Network request failed',
        status: 0,
        code: 'NETWORK_ERROR',
      });
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429; // Timeout or rate limit
    }

    // Retry server errors (5xx) and network errors
    return error.status >= 500 || error.status === 0;
  }

  // HTTP method helpers
  public async get<T = any>(url: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest(url, { ...config, method: 'GET' });
  }

  public async post<T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T = any>(url: string, config?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest(url, { ...config, method: 'DELETE' });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// React Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except timeout and rate limit
        if (error?.status >= 400 && error?.status < 500) {
          return error?.status === 408 || error?.status === 429;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Network status listener
NetInfo.addEventListener(state => {
  if (state.isConnected && state.isInternetReachable) {
    // Process offline queue when connection is restored
    apiClient.processOfflineQueue();
    // Refetch all queries
    queryClient.refetchQueries();
  }
});

export default apiClient;