import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeliveryRequest } from "../types/delivery";

const STORAGE_KEYS = {
  DELIVERY_REQUESTS: "delivery_requests",
  PENDING_SYNC: "pending_sync",
  USER_DATA: "user_data",
};

export class StorageService {
  // Save delivery requests
  static async saveDeliveryRequests(requests: DeliveryRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DELIVERY_REQUESTS, JSON.stringify(requests));
    } catch (error) {
      console.error("Error saving delivery requests:", error);
    }
  }

  // Get delivery requests
  static async getDeliveryRequests(): Promise<DeliveryRequest[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting delivery requests:", error);
      return [];
    }
  }

  // Add new delivery request
  static async addDeliveryRequest(request: DeliveryRequest): Promise<void> {
    try {
      const requests = await this.getDeliveryRequests();
      requests.push(request);
      await this.saveDeliveryRequests(requests);
    } catch (error) {
      console.error("Error adding delivery request:", error);
    }
  }

  // Update delivery request
  static async updateDeliveryRequest(id: string, updates: Partial<DeliveryRequest>): Promise<void> {
    try {
      const requests = await this.getDeliveryRequests();
      const index = requests.findIndex(req => req.id === id);
      if (index !== -1) {
        requests[index] = { ...requests[index], ...updates };
        await this.saveDeliveryRequests(requests);
      }
    } catch (error) {
      console.error("Error updating delivery request:", error);
    }
  }

  // Save pending sync requests
  static async savePendingSync(requests: DeliveryRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(requests));
    } catch (error) {
      console.error("Error saving pending sync:", error);
    }
  }

  // Get pending sync requests
  static async getPendingSync(): Promise<DeliveryRequest[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting pending sync:", error);
      return [];
    }
  }

  // Clear pending sync after successful sync
  static async clearPendingSync(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (error) {
      console.error("Error clearing pending sync:", error);
    }
  }

  // Save user data
  static async saveUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  // Get user data
  static async getUserData(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Clear all data (for logout)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DELIVERY_REQUESTS,
        STORAGE_KEYS.PENDING_SYNC,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  }
} 