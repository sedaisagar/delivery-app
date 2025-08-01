import NetInfo from "@react-native-community/netinfo";
import { DeliveryRequest } from "../types/delivery";
import { apiService } from "./api";
import { CreateDeliveryRequest, deliveryService } from "./delivery";
import { StorageService } from "./storage";

// Interface for server response format
interface ServerDeliveryRequest {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  customer_name: string;
  customer_phone: string;
  delivery_note?: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  sync_status: "synced" | "pending" | "failed";
  pending_sync: boolean;
  driver?: number;
  // Driver-specific fields from API
  assigned_at?: string;
  assigned_by_email?: string;
  driver_email?: string;
  driver_name?: string;
  customer_email?: string;
  coordinates?: {
    pickup: {
      latitude: number;
      longitude: number;
    };
    dropoff: {
      latitude: number;
      longitude: number;
    };
  };
  created_at: string;
  updated_at: string;
  synced_at?: string;
}

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
    console.log("Creating delivery request, isOnline:", this.isOnline);
    
    const newRequest: DeliveryRequest = {
      id: Date.now().toString(),
      ...requestData,
      createdAt: new Date().toISOString(),
      syncStatus: this.isOnline ? "pending" : "offline",
    };

    console.log("New request sync status:", newRequest.syncStatus);

    // Save to local storage
    await StorageService.addDeliveryRequest(newRequest);
    console.log("Request saved to local storage");

    // If online, try to sync immediately
    if (this.isOnline) {
      console.log("Device is online, attempting immediate sync");
      await this.syncToServer(newRequest);
    } else {
      console.log("Device is offline, adding to pending sync");
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
      
      if (pendingSync.length > 0) {
        // Convert to API format
        const apiRequests: CreateDeliveryRequest[] = pendingSync.map(request => ({
          pickup_address: request.pickupAddress,
          dropoff_address: request.dropoffAddress,
          customer_name: request.customerName,
          customer_phone: request.customerPhone,
          delivery_note: request.deliveryNote,
          coordinates: {
            pickup: {
              latitude: request.pickupCoordinates?.latitude || request.coordinates?.pickup?.latitude || 0,
              longitude: request.pickupCoordinates?.longitude || request.coordinates?.pickup?.longitude || 0,
            },
            dropoff: {
              latitude: request.dropoffCoordinates?.latitude || request.coordinates?.dropoff?.latitude || 0,
              longitude: request.dropoffCoordinates?.longitude || request.coordinates?.dropoff?.longitude || 0,
            },
          },
          pending_sync: true,
          local_id: request.id,
        }));

        // Sync to server
        await deliveryService.syncPendingRequests(apiRequests);
        
        // Clear pending sync after successful sync
        await StorageService.clearPendingSync();
        
        console.log(`Synced ${pendingSync.length} requests successfully`);
      }
    } catch (error) {
      console.log("Error syncing pending requests:", error);
    }
  }

  // Sync single request to server
  private static async syncToServer(request: DeliveryRequest): Promise<void> {
    try {
      console.log("Starting sync to server for request:", request.id);
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping sync");
        return;
      }

      console.log("User is authenticated, preparing API request");

      const apiRequest: CreateDeliveryRequest = {
        pickup_address: request.pickupAddress,
        dropoff_address: request.dropoffAddress,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        delivery_note: request.deliveryNote,
        coordinates: {
          pickup: {
            latitude: request.pickupCoordinates?.latitude || request.coordinates?.pickup?.latitude || 0,
            longitude: request.pickupCoordinates?.longitude || request.coordinates?.pickup?.longitude || 0,
          },
          dropoff: {
            latitude: request.dropoffCoordinates?.latitude || request.coordinates?.dropoff?.latitude || 0,
            longitude: request.dropoffCoordinates?.longitude || request.coordinates?.dropoff?.longitude || 0,
          },
        },
        pending_sync: false,
        local_id: request.id,
      };

      console.log("API request prepared:", apiRequest);

      // Create request on server
      const serverRequest = await deliveryService.createDeliveryRequest(apiRequest);
      console.log("Server response:", serverRequest);
      
      // Update local request with server ID
      await StorageService.updateDeliveryRequest(request.id, {
        syncStatus: "synced" as const,
        updatedAt: new Date().toISOString(),
        serverId: Number(serverRequest.id),
      });

      console.log(`Request ${request.id} synced successfully`);
    } catch (error) {
      console.log(`Error syncing request ${request.id}:`, error);
      
      // Update sync status to failed
      await StorageService.updateDeliveryRequest(request.id, {
        syncStatus: "failed" as const,
      });
      console.log("Updated sync status to failed");
    }
  }

  // Update delivery request status
  static async updateRequestStatus(id: string, status: DeliveryRequest["status"]): Promise<void> {
    const updates = {
      status,
      syncStatus: this.isOnline ? "pending" as const : "offline" as const,
      updatedAt: new Date().toISOString(),
    };

    await StorageService.updateDeliveryRequest(id, updates);

    // If online, sync immediately
    if (this.isOnline) {
      const requests = await StorageService.getDeliveryRequests();
      const request = requests.find(req => req.id === id);
      if (request && request.serverId) {
        try {
          await deliveryService.updateDeliveryRequest(request.serverId, { status });
          
          // Update local sync status
          await StorageService.updateDeliveryRequest(id, {
            syncStatus: "synced" as const,
          });
        } catch (error) {
          console.log("Error updating request status on server:", error);
          await StorageService.updateDeliveryRequest(id, {
            syncStatus: "failed" as const,
          });
        }
      }
    }
  }

  // Update delivery request partner
  static async updateRequestPartner(id: string, partnerId: number): Promise<void> {
    const updates = {
      partnerId,
      syncStatus: this.isOnline ? "pending" as const : "offline" as const,
      updatedAt: new Date().toISOString(),
    };

    await StorageService.updateDeliveryRequest(id, updates);

    // If online, sync immediately
    if (this.isOnline) {
      const requests = await StorageService.getDeliveryRequests();
      const request = requests.find(req => req.id === id);
      if (request && request.serverId) {
        try {
          await deliveryService.updateDeliveryRequest(request.serverId, { driver: partnerId });
          
          // Update local sync status
          await StorageService.updateDeliveryRequest(id, {
            syncStatus: "synced" as const,
          });
        } catch (error) {
          console.log("Error updating request partner on server:", error);
          await StorageService.updateDeliveryRequest(id, {
            syncStatus: "failed" as const,
          });
        }
      }
    }
  }

  // Get all delivery requests (local + server) based on user role
  static async getDeliveryRequests(): Promise<DeliveryRequest[]> {
    const localRequests = await StorageService.getDeliveryRequests();
    
    if (this.isOnline) {
      try {
        // Check if user is authenticated
        const isAuthenticated = await apiService.isAuthenticated();
        if (isAuthenticated) {
          // Get user profile to determine role
          const userProfile = await apiService.getProfile();
          console.log("User role:", userProfile.role);
          
          // Fetch from server based on user role
          try {
            let serverResponse;
            if (userProfile.role === "driver") {
              // Drivers see only assigned requests
              serverResponse = await deliveryService.getAssignedDeliveryRequests();
              console.log("Driver - assigned requests response");
            } else {
              // Customers see their own requests
              serverResponse = await deliveryService.getDeliveryRequests();
              console.log("Customer - own requests response");
            }
            
            const serverRequests = serverResponse?.results as unknown as ServerDeliveryRequest[] || [];
            console.log("Server requests count:", serverRequests.length);
          
            // Merge server requests with local requests
            const mergedRequests = [...localRequests];
            
            for (const serverRequest of serverRequests) {
              const existingIndex = mergedRequests.findIndex(req => req.serverId === serverRequest.id);
              if (existingIndex === -1) {
                console.log("Server response:", serverRequest);
                console.log("Converting server request to local format...");
                
                // Convert server request to local format
                const localRequest: DeliveryRequest = {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  pickupAddress: serverRequest.pickup_address,
                  dropoffAddress: serverRequest.dropoff_address,
                  customerName: serverRequest.customer_name,
                  customerPhone: serverRequest.customer_phone,
                  deliveryNote: serverRequest.delivery_note || "",
                  status: serverRequest.status,
                  syncStatus: "synced" as const,
                  createdAt: serverRequest.created_at,
                  updatedAt: serverRequest.updated_at,
                  serverId: serverRequest.id,
                  partnerId: serverRequest.driver || undefined,
                  // Driver-specific fields
                  assignedAt: serverRequest.assigned_at,
                  assignedByEmail: serverRequest.assigned_by_email,
                  driverEmail: serverRequest.driver_email,
                  driverName: serverRequest.driver_name,
                  customerEmail: serverRequest.customer_email,
                  pickupCoordinates: {
                    latitude: serverRequest.coordinates?.pickup?.latitude || 0,
                    longitude: serverRequest.coordinates?.pickup?.longitude || 0,
                  },
                  dropoffCoordinates: {
                    latitude: serverRequest.coordinates?.dropoff?.latitude || 0,
                    longitude: serverRequest.coordinates?.dropoff?.longitude || 0,
                  },
                };
                mergedRequests.push(localRequest);
              }
            }
            
            // Save merged requests to local storage
            await StorageService.saveDeliveryRequests(mergedRequests);
            return mergedRequests;
          } catch (error) {
            console.log("Error processing server response:", error);
          }
        }
      } catch (error) {
        console.log("Error fetching from server:", error);
      }
    }
    
    return localRequests;
  }

  // Force sync all pending requests and refresh from server
  static async forceSync(): Promise<void> {
    console.log("Starting force sync...");
    try {
      // First sync any pending requests
      await this.syncPendingRequests();
      
      // Clear pending sync
      await StorageService.clearPendingSync();
      
      // Refresh from server
      await this.refreshFromServer();
      
      console.log("Force sync completed successfully");
    } catch (error) {
      console.log("Error during force sync:", error);
    }
  }

  // Refresh data from server (wipe local synced data and pull fresh)
  private static async refreshFromServer(): Promise<void> {
    try {
      console.log("Refreshing data from server...");
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping server refresh");
        return;
      }

      // Get fresh data from server
      const serverResponse = await deliveryService.getDeliveryRequests();
      
      if (serverResponse && serverResponse.results) {
        const serverRequests = serverResponse.results as unknown as ServerDeliveryRequest[] || [];

        // Convert server requests to local format
        const freshRequests: DeliveryRequest[] = serverRequests.map(serverRequest => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          pickupAddress: serverRequest.pickup_address,
          dropoffAddress: serverRequest.dropoff_address,
          customerName: serverRequest.customer_name,
          customerPhone: serverRequest.customer_phone,
          deliveryNote: serverRequest.delivery_note || "",
          status: serverRequest.status,
          syncStatus: "synced" as const,
          createdAt: serverRequest.created_at,
          updatedAt: serverRequest.updated_at,
          serverId: serverRequest.id,
          pickupCoordinates: {
            latitude: serverRequest.coordinates?.pickup?.latitude || 0,
            longitude: serverRequest.coordinates?.pickup?.longitude || 0,
          },
          dropoffCoordinates: {
            latitude: serverRequest.coordinates?.dropoff?.latitude || 0,
            longitude: serverRequest.coordinates?.dropoff?.longitude || 0,
          },
        }));

        // Wipe local synced data and save fresh data from server
        await StorageService.saveDeliveryRequests(freshRequests);
        console.log("Refreshed local data with server data:", freshRequests.length, "requests");
      }
    } catch (error) {
      console.log("Error refreshing from server:", error);
    }
  }
} 