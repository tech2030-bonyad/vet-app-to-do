import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for offline functionality
export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface OfflineData {
  [key: string]: {
    data: any;
    timestamp: number;
    version: number;
    lastSync: number;
  };
}

export interface OfflineState {
  isOnline: boolean;
  syncQueue: OfflineAction[];
  offlineData: OfflineData;
  isSyncing: boolean;
  lastSyncTime: number;
  syncErrors: string[];
}

export interface OfflineStore extends OfflineState {
  // Connection status
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Queue management
  addToSyncQueue: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromSyncQueue: (actionId: string) => void;
  clearSyncQueue: () => void;
  updateSyncQueueItem: (actionId: string, updates: Partial<OfflineAction>) => void;
  
  // Data management
  setOfflineData: (key: string, data: any, version?: number) => void;
  getOfflineData: (key: string) => any;
  removeOfflineData: (key: string) => void;
  clearOfflineData: () => void;
  
  // Sync management
  setSyncStatus: (isSyncing: boolean) => void;
  setLastSyncTime: (timestamp: number) => void;
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
}

// Zustand store for offline state management
export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnline: true,
      syncQueue: [],
      offlineData: {},
      isSyncing: false,
      lastSyncTime: 0,
      syncErrors: [],

      // Connection status
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      // Queue management
      addToSyncQueue: (action) => {
        const newAction: OfflineAction = {
          ...action,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          retryCount: 0,
        };
        
        set((state) => ({
          syncQueue: [...state.syncQueue, newAction],
        }));
      },

      removeFromSyncQueue: (actionId: string) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter(action => action.id !== actionId),
        }));
      },

      clearSyncQueue: () => {
        set({ syncQueue: [] });
      },

      updateSyncQueueItem: (actionId: string, updates: Partial<OfflineAction>) => {
        set((state) => ({
          syncQueue: state.syncQueue.map(action =>
            action.id === actionId ? { ...action, ...updates } : action
          ),
        }));
      },

      // Data management
      setOfflineData: (key: string, data: any, version = 1) => {
        set((state) => ({
          offlineData: {
            ...state.offlineData,
            [key]: {
              data,
              timestamp: Date.now(),
              version,
              lastSync: state.offlineData[key]?.lastSync || 0,
            },
          },
        }));
      },

      getOfflineData: (key: string) => {
        const state = get();
        return state.offlineData[key]?.data || null;
      },

      removeOfflineData: (key: string) => {
        set((state) => {
          const newOfflineData = { ...state.offlineData };
          delete newOfflineData[key];
          return { offlineData: newOfflineData };
        });
      },

      clearOfflineData: () => {
        set({ offlineData: {} });
      },

      // Sync management
      setSyncStatus: (isSyncing: boolean) => {
        set({ isSyncing });
      },

      setLastSyncTime: (timestamp: number) => {
        set({ lastSyncTime: timestamp });
      },

      addSyncError: (error: string) => {
        set((state) => ({
          syncErrors: [...state.syncErrors, error],
        }));
      },

      clearSyncErrors: () => {
        set({ syncErrors: [] });
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        syncQueue: state.syncQueue,
        offlineData: state.offlineData,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

/**
 * Offline Service Class
 * Handles offline functionality, data caching, and network monitoring
 */
export class OfflineService {
  private static instance: OfflineService;
  private networkUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.initializeNetworkListener();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Initialize network status listener
   */
  private initializeNetworkListener(): void {
    this.networkUnsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      useOfflineStore.getState().setOnlineStatus(isOnline || false);
    });
  }

  /**
   * Check current network status
   */
  public async checkNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      const isOnline = state.isConnected && state.isInternetReachable;
      useOfflineStore.getState().setOnlineStatus(isOnline || false);
      return isOnline || false;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }

  /**
   * Store data for offline access
   */
  public async storeOfflineData(key: string, data: any, version = 1): Promise<void> {
    try {
      useOfflineStore.getState().setOfflineData(key, data, version);
    } catch (error) {
      console.error('Error storing offline data:', error);
      throw new Error('Failed to store offline data');
    }
  }

  /**
   * Retrieve offline data
   */
  public getOfflineData(key: string): any {
    return useOfflineStore.getState().getOfflineData(key);
  }

  /**
   * Add action to sync queue
   */
  public addToSyncQueue(
    type: string,
    payload: any,
    endpoint: string,
    method: OfflineAction['method'] = 'POST',
    maxRetries = 3
  ): void {
    useOfflineStore.getState().addToSyncQueue({
      type,
      payload,
      endpoint,
      method,
      maxRetries,
    });
  }

  /**
   * Clear all offline data
   */
  public clearOfflineData(): void {
    useOfflineStore.getState().clearOfflineData();
  }

  /**
   * Get sync queue length
   */
  public getSyncQueueLength(): number {
    return useOfflineStore.getState().syncQueue.length;
  }

  /**
   * Check if app is currently online
   */
  public isOnline(): boolean {
    return useOfflineStore.getState().isOnline;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();