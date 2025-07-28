import NetInfo from "@react-native-community/netinfo";
import { DeliveryRequest } from "../types/delivery";
import { StorageService } from "./storage";

export class SyncService {
  private static isOnline = true;

  // Initialize sync service
  static async initialize() {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.syncPendingRequests();
      }
    });

    // Initial sync if online
    const netInfo = await NetInfo.fetch();
    this.isOnline = netInfo.isConnected ?? false;
    if (this.isOnline) {
      this.syncPendingRequests();
    }
  }

  // Check if device is online
  static isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Create delivery request with offline support
  static async createDeliveryRequest(requestData: Omit<DeliveryRequest, "id" | "createdAt" | "syncStatus">): Promise<DeliveryRequest> {
    const newRequest: DeliveryRequest = {
      id: Date.now().toString(),
      ...requestData,
      createdAt: new Date().toISOString(),
      syncStatus: this.isOnline ? "pending" : "offline",
    };

    // Save to local storage
    await StorageService.addDeliveryRequest(newRequest);

    // If online, try to sync immediately
    if (this.isOnline) {
      await this.syncToServer(newRequest);
    } else {
      // Add to pending sync
      const pendingSync = await StorageService.getPendingSync();
      pendingSync.push(newRequest);
      await StorageService.savePendingSync(pendingSync);
    }

    return newRequest;
  }

  // Sync pending requests to server
  static async syncPendingRequests(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const pendingSync = await StorageService.getPendingSync();
      
      for (const request of pendingSync) {
        await this.syncToServer(request);
      }

      // Clear pending sync after successful sync
      await StorageService.clearPendingSync();
    } catch (error) {
      console.error("Error syncing pending requests:", error);
    }
  }

  // Sync single request to server
  private static async syncToServer(request: DeliveryRequest): Promise<void> {
    try {
      // TODO: Implement actual API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sync status
      await StorageService.updateDeliveryRequest(request.id, {
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
      });

      console.log(`Request ${request.id} synced successfully`);
    } catch (error) {
      console.error(`Error syncing request ${request.id}:`, error);
      
      // Update sync status to failed
      await StorageService.updateDeliveryRequest(request.id, {
        syncStatus: "failed",
      });
    }
  }

  // Update delivery request status
  static async updateRequestStatus(id: string, status: DeliveryRequest["status"]): Promise<void> {
    const updates = {
      status,
      syncStatus: this.isOnline ? "pending" : "offline",
      updatedAt: new Date().toISOString(),
    };

    await StorageService.updateDeliveryRequest(id, updates);

    // If online, sync immediately
    if (this.isOnline) {
      const requests = await StorageService.getDeliveryRequests();
      const request = requests.find(req => req.id === id);
      if (request) {
        await this.syncToServer(request);
      }
    }
  }

  // Get all delivery requests (local + server)
  static async getDeliveryRequests(): Promise<DeliveryRequest[]> {
    const localRequests = await StorageService.getDeliveryRequests();
    
    if (this.isOnline) {
      // TODO: Fetch from server and merge
      // For now, return local requests
      return localRequests;
    }
    
    return localRequests;
  }

  // Force sync all data
  static async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error("Device is offline");
    }

    await this.syncPendingRequests();
  }
} 