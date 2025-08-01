export interface DeliveryRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  syncStatus: "synced" | "pending" | "failed" | "offline";
  createdAt: string;
  updatedAt?: string;
  serverId?: number; // Server-side ID for API integration
  partnerId?: number; // Assigned driver/partner ID
  partnerName?: string; // Partner name for display
  // Driver-specific fields from API
  assignedAt?: string;
  assignedByEmail?: string;
  driverEmail?: string;
  driverName?: string; // Driver name from API
  customerEmail?: string;
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
  // Individual coordinate properties for easier access
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  dropoffCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
  distance: string;
  available: boolean;
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

export interface Statistics {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  assignedDeliveries: number;
  todayCompleted: number;
  todayPending: number;
  weekCompleted: number;
  monthCompleted: number;
  period: "all" | "today" | "week" | "month";
} 