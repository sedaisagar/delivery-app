export interface DeliveryRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  syncStatus: "synced" | "pending" | "failed" | "offline";
  createdAt: string;
  updatedAt?: string;
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
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryFormData {
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  pickupLocation?: Location;
  dropoffLocation?: Location;
} 