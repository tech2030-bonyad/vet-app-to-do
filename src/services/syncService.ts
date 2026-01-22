import { offlineService, useOfflineStore, OfflineAction } from './offlineService';
import { resolveConflict, ConflictResolutionStrategy } from '../utils/conflictResolution';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export interface SyncOptions {
  maxConcurrentRequests?: number;
  retryDelay?: number;
  conflictResolution?: ConflictResolutionStrategy;
  onProgress?: (progress: number, total: number) => void;
}

/**
 * Sync Service Class
 * Handles synchronization of offline data with the server
 */
export class SyncService {
  private static instance: SyncService;
  private apiBaseUrl: string;
  private authToken: string | null = null;

  private constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(apiBaseUrl?: string): SyncService {
    if (!SyncService.instance) {
      if (!apiBaseUrl) {
        throw new Error('API base URL is required for first initialization');
      }
      SyncService.instance = new SyncService(apiBaseUrl);
    }
    return SyncService.instance;
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Perform full synchronization
   */
  public async performSync(options: SyncOptions = {}): Promise<SyncResult> {
    const store = useOfflineStore.getState();
    
    if (!offlineService.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    if (store.isSyncing) {
      throw new Error('Sync already in progress');
    }

    store.setSyncStatus(true);
    store.clearSyncErrors();

    const {
      maxConcurrentRequests = 3,
      retryDelay = 1000,
      conflictResolution = 'client-wins',
      onProgress,
    } = options;

    const syncQueue = [...store.syncQueue];
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      // Process sync queue in batches
      const batches = this.createBatches(syncQueue, maxConcurrentRequests);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchPromises = batch.map(action => 
          this.processSyncAction(action, conflictResolution, retryDelay)
        );

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const action = batch[index];
          
          if (result.status === 'fulfilled' && result.value.success) {
            syncedCount++;
            store.removeFromSyncQueue(action.id);
          } else {
            failedCount++;
            const error = result.status === 'rejected' 
              ? result.reason.message 
              : result.value.error;
            
            errors.push(`Action ${action.type}: ${error}`);
            store.addSyncError(error);
            
            // Update retry count
            if (action.retryCount < action.maxRetries) {
              store.updateSyncQueueItem(action.id, {
                retryCount: action.retryCount + 1,
              });
            } else {
              // Remove from queue after max retries
              store.removeFromSyncQueue(action.id);
            }
          }
        });

        // Report progress
        if (onProgress) {
          const totalProcessed = (i + 1) * maxConcurrentRequests;
          onProgress(Math.min(totalProcessed, syncQueue.length), syncQueue.length);
        }
      }

      // Sync offline data with server
      await this.syncOfflineData(conflictResolution);

      store.setLastSyncTime(Date.now());
      
      return {
        success: failedCount === 0,
        syncedCount,
        failedCount,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      store.addSyncError(errorMessage);
      
      return {
        success: false,
        syncedCount,
        failedCount: syncQueue.length - syncedCount,
        errors: [errorMessage, ...errors],
      };
    } finally {
      store.setSyncStatus(false);
    }
  }

  /**
   * Process individual sync action
   */
  private async processSyncAction(
    action: OfflineAction,
    conflictResolution: ConflictResolutionStrategy,
    retryDelay: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeApiRequest(action);
      
      if (!response.ok) {
        // Handle conflict (409) or other errors
        if (response.status === 409) {
          const serverData = await response.json();
          const resolvedData = await resolveConflict(
            action.payload,
            serverData,
            conflictResolution
          );
          
          // Retry with resolved data
          const retryAction = { ...action, payload: resolvedData };
          const retryResponse = await this.makeApiRequest(retryAction);
          
          if (!retryResponse.ok) {
            throw new Error(`Retry failed: ${retryResponse.statusText}`);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return { success: true };
    } catch (error) {
      // Implement exponential backoff for retries
      if (action.retryCount < action.maxRetries) {
        const delay = retryDelay * Math.pow(2, action.retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make API request for sync action
   */
  private async makeApiRequest(action: OfflineAction): Promise<Response> {
    const url = `${this.apiBaseUrl}${action.endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const requestOptions: RequestInit = {
      method: action.method,
      headers,
    };

    if (action.method !== 'GET' && action.payload) {
      requestOptions.body = JSON.stringify(action.payload);
    }

    return fetch(url, requestOptions);
  }

  /**
   * Sync offline data with server
   */
  private async syncOfflineData(conflictResolution: ConflictResolutionStrategy): Promise<void> {
    const store = useOfflineStore.getState();
    const offlineData = store.offlineData;

    for (const [key, dataItem] of Object.entries(offlineData)) {
      try {
        // Check if data needs syncing (modified since last sync)
        if (dataItem.timestamp > dataItem.lastSync) {
          const response = await fetch(`${this.apiBaseUrl}/sync/${key}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
          });

          if (response.ok) {
            const serverData = await response.json();
            
            // Check for conflicts
            if (serverData.version > dataItem.version) {
              const resolvedData = await resolveConflict(
                dataItem.data,
                serverData.data,
                conflictResolution
              );
              
              // Update local data with resolved version
              store.setOfflineData(key, resolvedData, serverData.version + 1);
              
              // Send resolved data to server
              await fetch(`${this.apiBaseUrl}/sync/${key}`, {
                method: 'PUT',
                headers: {
                  ...this.getAuthHeaders(),
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  data: resolvedData,
                  version: serverData.version + 1,
                }),
              });
            } else {
              // No conflict, just update server
              await fetch(`${this.apiBaseUrl}/sync/${key}`, {
                method: 'PUT',
                headers: {
                  ...this.getAuthHeaders(),
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  data: dataItem.data,
                  version: dataItem.version,
                }),
              });
            }

            // Update last sync timestamp
            store.setOfflineData(key, dataItem.data, dataItem.version);
          }
        }
      } catch (error) {
        console.error(`Error syncing data for key ${key}:`, error);
        store.addSyncError(`Failed to sync ${key}: ${error}`);
      }
    }
  }

  /**
   * Create batches for concurrent processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Force sync specific data key
   */
  public async forceSyncData(key: string): Promise<void> {
    if (!offlineService.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    const store = useOfflineStore.getState();
    const dataItem = store.offlineData[key];

    if (!dataItem) {
      throw new Error(`No offline data found for key: ${key}`);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/sync/${key}`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataItem.data,
          version: dataItem.version,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update last sync timestamp
      store.setOfflineData(key, dataItem.data, dataItem.version);
    } catch (error) {
      console.error(`Error force syncing data for key ${key}:`, error);
      throw error;
    }
  }
}

// Export singleton instance (will be initialized when first used)
export const createSyncService = (apiBaseUrl: string) => 
  SyncService.getInstance(apiBaseUrl);