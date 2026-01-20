import { useEffect, useState, useCallback } from 'react';
import { useOfflineStore } from '../services/offlineService';
import { SyncService, SyncResult, SyncOptions } from '../services/syncService';
import { offlineService } from '../services/offlineService';

export interface UseOfflineReturn {
  // Connection status
  isOnline: boolean;
  isOffline: boolean;
  
  // Sync status
  isSyncing: boolean;
  syncQueueLength: number;
  lastSyncTime: number;
  syncErrors: string[];
  
  // Actions
  performSync: (options?: SyncOptions) => Promise<SyncResult>;
  addToSyncQueue: (
    type: string,
    payload: any,
    endpoint: string,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    maxRetries?: number
  ) => void;
  clearSyncQueue: () => void;
  clearSyncErrors: () => void;
  
  // Data management
  storeOfflineData: (key: string, data: any, version?: number) => Promise<void>;
  getOfflineData: (key: string) => any;
  removeOfflineData: (key: string) => void;
  
  // Utilities
  checkNetworkStatus: () => Promise<boolean>;
  canPerformAction: () => boolean;
}

/**
 * Custom hook for offline functionality
 * Provides comprehensive offline support with sync capabilities
 */
export const useOffline = (apiBaseUrl?: string): UseOfflineReturn => {
  const {
    isOnline,
    syncQueue,
    isSyncing,
    lastSyncTime,
    syncErrors,
    addToSyncQueue: addToQueue,
    clearSyncQueue: clearQueue,
    clearSyncErrors: clearErrors,
    setOfflineData,
    getOfflineData: getStoredData,
    removeOfflineData: removeStoredData,
  } = useOfflineStore();

  const [syncService, setSyncService] = useState<SyncService | null>(null);

  // Initialize sync service
  useEffect(() => {
    if (apiBaseUrl && !syncService) {
      try {
        const service = SyncService.getInstance(apiBaseUrl);
        setSyncService(service);
      } catch (error) {
        console.error('Failed to initialize sync service:', error);
      }
    }
  }, [apiBaseUrl, syncService]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncService && syncQueue.length > 0) {
      // Debounce auto-sync to avoid multiple simultaneous syncs
      const timeoutId = setTimeout(() => {
        performSync({ maxConcurrentRequests: 2 });
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, syncService, syncQueue.length]);

  /**
   * Perform synchronization
   */
  const performSync = useCallback(async (options?: SyncOptions): Promise<SyncResult> => {
    if (!syncService) {
      throw new Error('Sync service not initialized. Please provide apiBaseUrl.');
    }

    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      const result = await syncService.performSync(options);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [syncService, isOnline]);

  /**
   * Add action to sync queue
   */
  const addToSyncQueue = useCallback((
    type: string,
    payload: any,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    maxRetries = 3
  ) => {
    addToQueue({
      type,
      payload,
      endpoint,
      method,
      maxRetries,
    });
  }, [addToQueue]);

  /**
   * Store data for offline access
   */
  const storeOfflineData = useCallback(async (
    key: string,
    data: any,
    version = 1
  ): Promise<void> => {
    try {
      await offlineService.storeOfflineData(key, data, version);
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }, []);

  /**
   * Get offline data
   */
  const getOfflineData = useCallback((key: string) => {
    return getStoredData(key);
  }, [getStoredData]);

  /**
   * Remove offline data
   */
  const removeOfflineData = useCallback((key: string) => {
    removeStoredData(key);
  }, [removeStoredData]);

  /**
   * Check network status
   */
  const checkNetworkStatus = useCallback(async (): Promise<boolean> => {
    return await offlineService.checkNetworkStatus();
  }, []);

  /**
   * Check if action can be performed (online or has offline support)
   */
  const canPerformAction = useCallback((): boolean => {
    return isOnline || syncQueue.length < 100; // Prevent queue overflow
  }, [isOnline, syncQueue.length]);

  return {
    // Connection status
    isOnline,
    isOffline: !isOnline,
    
    // Sync status
    isSyncing,
    syncQueueLength: syncQueue.length,
    lastSyncTime,
    syncErrors,
    
    // Actions
    performSync,
    addToSyncQueue,
    clearSyncQueue: clearQueue,
    clearSyncErrors: clearErrors,
    
    // Data management
    storeOfflineData,
    getOfflineData,
    removeOfflineData,
    
    // Utilities
    checkNetworkStatus,
    canPerformAction,
  };
};

/**
 * Hook for offline-first data fetching
 * Automatically handles offline/online data retrieval
 */
export const useOfflineData = <T>(
  key: string,
  fetchFn?: () => Promise<T>,
  options: {
    refetchOnReconnect?: boolean;
    cacheTime?: number;
  } = {}
) => {
  const { isOnline, getOfflineData, storeOfflineData } = useOffline();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refetchOnReconnect = true, cacheTime = 5 * 60 * 1000 } = options;

  /**
   * Fetch data with offline support
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get cached data first
      const cachedData = getOfflineData(key);
      
      if (cachedData && !forceRefresh) {
        const { data: storedData, timestamp } = cachedData;
        const isExpired = Date.now() - timestamp > cacheTime;
        
        if (!isExpired || !isOnline) {
          setData(storedData);
          setIsLoading(false);
          
          // If online and data is expired, fetch in background
          if (isOnline && isExpired && fetchFn) {
            fetchFn()
              .then(freshData => {
                storeOfflineData(key, freshData);
                setData(freshData);
              })
              .catch(console.error);
          }
          
          return storedData;
        }
      }

      // Fetch fresh data if online
      if (isOnline && fetchFn) {
        const freshData = await fetchFn();
        await storeOfflineData(key, freshData);
        setData(freshData);
        return freshData;
      }

      // Return cached data if offline
      if (cachedData) {
        setData(cachedData.data);
        return cachedData.data;
      }

      throw new Error('No data available offline');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Try to return cached data on error
      const cachedData = getOfflineData(key);
      if (cachedData) {
        setData(cachedData.data);
        return cachedData.data;
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, getOfflineData, storeOfflineData, isOnline, fetchFn, cacheTime]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [key]);

  // Refetch when coming online
  useEffect(() => {
    if (isOnline && refetchOnReconnect && fetchFn) {
      fetchData(true);
    }
  }, [isOnline, refetchOnReconnect, fetchFn, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    isStale: !isOnline && !!data,
  };
};