import { DeliveryRequest, Partner } from "../types/delivery";
import { apiService } from "./api";

export interface CreateDeliveryRequest {
    pickup_address: string;
    dropoff_address: string;
    customer_name: string;
    customer_phone: string;
    delivery_note?: string;
    coordinates: {
        pickup: {
            latitude: number;
            longitude: number;
        };
        dropoff: {
            latitude: number;
            longitude: number;
        };
    };
    pending_sync?: boolean;
    local_id?: string;
}

export interface UpdateDeliveryRequest {
    status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    driver?: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
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

class DeliveryService {
    // Convert snake_case API response to camelCase
    private convertApiResponseToCamelCase(apiResponse: any): DeliveryRequest {
        // Handle coordinates that might come as a string
        let coordinates = null;
        if (apiResponse.coordinates) {
            if (typeof apiResponse.coordinates === 'string') {
                try {
                    coordinates = JSON.parse(apiResponse.coordinates);
                } catch (error) {
                    console.log("Error parsing coordinates string:", error);
                    coordinates = null;
                }
            } else {
                coordinates = apiResponse.coordinates;
            }
        }

        return {
            id: apiResponse.id?.toString() || Date.now().toString(),
            pickupAddress: apiResponse.pickup_address || "",
            dropoffAddress: apiResponse.dropoff_address || "",
            customerName: apiResponse.customer_name || "",
            customerPhone: apiResponse.customer_phone || "",
            deliveryNote: apiResponse.delivery_note || "",
            status: apiResponse.status || "pending",
            syncStatus: "synced" as const,
            createdAt: apiResponse.created_at || new Date().toISOString(),
            updatedAt: apiResponse.updated_at || new Date().toISOString(),
            serverId: apiResponse.id,
            // Driver-specific fields
            assignedAt: apiResponse.assigned_at,
            assignedByEmail: apiResponse.assigned_by_email,
            driverEmail: apiResponse.driver_email,
            driverName: apiResponse.driver_name,
            customerEmail: apiResponse.customer_email,
            // Coordinates
            coordinates: coordinates,
            pickupCoordinates: coordinates?.pickup || null,
            dropoffCoordinates: coordinates?.dropoff || null,
        };
    }

    // Get delivery requests based on user role
    async getDeliveryRequests(page?: number, search?: string, ordering?: string): Promise<PaginatedResponse<DeliveryRequest>> {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (search) params.append("search", search);
        if (ordering) params.append("ordering", ordering);

        const endpoint = `/delivery-requests/${params.toString() ? `?${params.toString()}` : ""}`;
       
        
        try {
            const response = await apiService.request<any>(endpoint);
            
            // Handle wrapped response structure
            let actualResponse = response;
            if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
                console.log("Response is wrapped, extracting data");
                actualResponse = response.data;
            }
            
            // Check if response has the expected structure
            if (!actualResponse || typeof actualResponse !== 'object') {
                console.log("Invalid response structure");
                return {
                    count: 0,
                    next: null,
                    previous: null,
                    results: []
                };
            }
            
            // Handle different response structures
            if (actualResponse.results) {
                console.log("Response has 'results' key");
                return {
                    ...actualResponse,
                    results: actualResponse.results.map((item: any) => this.convertApiResponseToCamelCase(item))
                };
            } else if (actualResponse.data && actualResponse.data.requests) {
                console.log("Response has 'data.requests' key");
                const pagination = actualResponse.data.pagination;
                return {
                    count: pagination?.total || 0,
                    next: pagination?.page < pagination?.totalPages ? `page=${pagination.page + 1}` : null,
                    previous: pagination?.page > 1 ? `page=${pagination.page - 1}` : null,
                    results: actualResponse.data.requests.map((item: any) => this.convertApiResponseToCamelCase(item)),
                };
            } else if (actualResponse.requests) {
                console.log("Response has 'requests' key, converting to 'results'");
                return {
                    count: actualResponse.pagination?.total || 0,
                    next: actualResponse.pagination?.page < actualResponse.pagination?.totalPages ? `page=${actualResponse.pagination.page + 1}` : null,
                    previous: actualResponse.pagination?.page > 1 ? `page=${actualResponse.pagination.page - 1}` : null,
                    results: actualResponse.requests.map((item: any) => this.convertApiResponseToCamelCase(item)),
                };
            } else if (Array.isArray(actualResponse)) {
                console.log("Response is direct array, wrapping in results");
                return {
                    count: actualResponse.length,
                    next: null,
                    previous: null,
                    results: actualResponse.map((item: any) => this.convertApiResponseToCamelCase(item)),
                };
            } else {
                console.log("Invalid response structure");
                return {
                    count: 0,
                    next: null,
                    previous: null,
                    results: [],
                };
            }
        } catch (error) {
            console.log("Error in getDeliveryRequests:", error);
            // Return empty response on error
            return {
                count: 0,
                next: null,
                previous: null,
                results: []
            };
        }
    }

    // Get assigned delivery requests (for drivers)
    async getAssignedDeliveryRequests(page?: number, search?: string, ordering?: string): Promise<PaginatedResponse<DeliveryRequest>> {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (search) params.append("search", search);
        if (ordering) params.append("ordering", ordering);

        const endpoint = `/delivery-requests/assigned/${params.toString() ? `?${params.toString()}` : ""}`;
        console.log("Calling getAssignedDeliveryRequests with endpoint:", endpoint);
        
        try {
            const response = await apiService.request<any>(endpoint);
            
            // Handle wrapped response structure
            let actualResponse = response;
            if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
                console.log("Response is wrapped, extracting data");
                actualResponse = response.data;
            }
            
            // Check if response has the expected structure
            if (!actualResponse || typeof actualResponse !== 'object') {
                console.log("Invalid response structure");
                return {
                    count: 0,
                    next: null,
                    previous: null,
                    results: []
                };
            }
            
            // Handle different response structures
            if (actualResponse.results) {
                console.log("Response has 'results' key");
                return {
                    ...actualResponse,
                    results: actualResponse.results.map((item: any) => this.convertApiResponseToCamelCase(item))
                };
            } else if (actualResponse.requests) {
                console.log("Response has 'requests' key, converting to 'results'");
                return {
                    ...actualResponse,
                    results: actualResponse.requests.map((item: any) => this.convertApiResponseToCamelCase(item)),
                };
            } else if (Array.isArray(actualResponse)) {
                console.log("Response is direct array, wrapping in results");
                return {
                    count: actualResponse.length,
                    next: null,
                    previous: null,
                    results: actualResponse.map((item: any) => this.convertApiResponseToCamelCase(item)),
                };
            } else {
                console.log("Invalid response structure");
                return {
                    count: 0,
                    next: null,
                    previous: null,
                    results: [],
                };
            }
        } catch (error) {
            console.log("Error in getAssignedDeliveryRequests:", error);
            // Return empty response on error
            return {
                count: 0,
                next: null,
                previous: null,
                results: [],
            };
        }
    }

    async getDeliveryRequest(id: number): Promise<DeliveryRequest> {
        console.log("Calling getDeliveryRequest with ID:", id);
        console.log("API endpoint:", `/delivery-requests/${id}/`);
        
        try {
            const response = await apiService.request<any>(`/delivery-requests/${id}/`);
            console.log("Raw API response:", JSON.stringify(response, null, 2));
            
            // Handle wrapped response structure
            let actualResponse = response;
            if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
                console.log("Response is wrapped, extracting data");
                actualResponse = response.data;
            }
            
            const convertedResponse = this.convertApiResponseToCamelCase(actualResponse);
            console.log("Converted response:", convertedResponse);
            
            return convertedResponse;
        } catch (error) {
            console.log("Error in getDeliveryRequest:", error);
            throw error;
        }
    }

    async createDeliveryRequest(request: CreateDeliveryRequest): Promise<DeliveryRequest> {
        console.log("Creating delivery request on server:", request);
        try {
            const response = await apiService.request<DeliveryRequest>("/delivery-requests/", {
                method: "POST",
                body: JSON.stringify(request),
            });
            console.log("Server response for create delivery request");
            return response;
        } catch (error) {
            console.log("Error creating delivery request on server:", error);
            throw error;
        }
    }

    async updateDeliveryRequest(id: number, updates: UpdateDeliveryRequest): Promise<DeliveryRequest> {
        return apiService.request<DeliveryRequest>(`/delivery-requests/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(updates),
        });
    }

    async deleteDeliveryRequest(id: number): Promise<void> {
        return apiService.request<void>(`/delivery-requests/${id}/`, {
            method: "DELETE",
        });
    }

    async getPartners(location?: string, radius?: number): Promise<Partner[]> {
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (radius) params.append("radius", radius.toString());

        const endpoint = `/partners/${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await apiService.request<{ success: boolean; data: Partner[] }>(endpoint);
        return response.data || [];
    }

    async getDirections(
        pickupLat: number,
        pickupLng: number,
        dropoffLat: number,
        dropoffLng: number,
        mode?: string
    ): Promise<any> {
        const params = new URLSearchParams({
            pickup_lat: pickupLat.toString(),
            pickup_lng: pickupLng.toString(),
            dropoff_lat: dropoffLat.toString(),
            dropoff_lng: dropoffLng.toString(),
        });
        if (mode) params.append("mode", mode);

        const endpoint = `/directions/?${params.toString()}`;
        return apiService.request<any>(endpoint);
    }

    async getStatistics(period?: "all" | "today" | "week" | "month", userRole?: "customer" | "driver"): Promise<Statistics> {
        const params = new URLSearchParams();
        if (period && period !== "all") {
            params.append("period", period);
        }

        // Use correct endpoint based on user role
        const roleEndpoint = userRole === "driver" ? "driver" : "customer";
        const endpoint = `/statistics/${roleEndpoint}/${params.toString() ? `?${params.toString()}` : ""}`;
        console.log("Calling getStatistics with endpoint:", endpoint);
        
        try {
            const response = await apiService.request<{ success: boolean; data: Statistics }>(endpoint);
            console.log("Raw statistics response");
            
            if (response && response.success && response.data) {
                return response.data;
            }
            
            console.log("Invalid statistics response structure");
            return {
                totalDeliveries: 0,
                completedDeliveries: 0,
                pendingDeliveries: 0,
                inProgressDeliveries: 0,
                assignedDeliveries: 0,
                todayCompleted: 0,
                todayPending: 0,
                weekCompleted: 0,
                monthCompleted: 0,
                period: period || "all"
            };
        } catch (error) {
            console.log("Error in getStatistics:", error);
            return {
                totalDeliveries: 0,
                completedDeliveries: 0,
                pendingDeliveries: 0,
                inProgressDeliveries: 0,
                assignedDeliveries: 0,
                todayCompleted: 0,
                todayPending: 0,
                weekCompleted: 0,
                monthCompleted: 0,
                period: period || "all"
            };
        }
    }

    async syncPendingRequests(requests: CreateDeliveryRequest[]): Promise<any> {
        return apiService.request<any>("/sync/pending/", {
            method: "POST",
            body: JSON.stringify({ requests }),
        });
    }

    async getSyncStatus(): Promise<any> {
        const response = await apiService.request<{ success: boolean; data: any }>("/sync/status/");
        return response.data || {};
    }
}

export const deliveryService = new DeliveryService(); 