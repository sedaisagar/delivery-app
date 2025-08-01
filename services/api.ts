import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../constants";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    register_as: "driver" | "customer";
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

export interface UserProfile {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: "driver" | "admin" | "customer";
    avatar?: string;
}

export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    message?: string;
}

class ApiService {
    private baseURL: string;
    private onForceLogout?: () => void;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        console.log('API Service initialized with base URL:', this.baseURL);
    }

    // Set callback for force logout
    setForceLogoutCallback(callback: () => void) {
        this.onForceLogout = callback;
    }

    // Test network connectivity
    async testConnection(): Promise<boolean> {
        try {
            // Use OPTIONS request to test connectivity without authentication
            const response = await fetch(`${this.baseURL}/auth/login/`, {
                method: "OPTIONS",
                headers: { "Content-Type": "application/json" },
            });
            console.log('Connection test response:', response.status);
            return response.status !== 0; // 0 means network error
        } catch (error) {
            console.log('Connection test failed:', error);
            return false;
        }
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        console.log(`API Response: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log("Error response status:", response.status);
            
            // For 400 errors, include the full error data for field-specific handling
            if (response.status === 400) {
                console.log("Throwing 400 error with data:", JSON.stringify(errorData));
                throw new Error(JSON.stringify(errorData));
            }
            
            // For all other errors (401, 403, 500, etc.), throw with message
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Handle successful responses
        try {
            const text = await response.text();
            console.log("Response body length:", text.length);
            
            if (!text || text.trim() === '') {
                console.log("Empty response body, returning empty object");
                return {} as T;
            }
            
            const data = JSON.parse(text);
            return data;
        } catch (error) {
            console.log("Error parsing response:", error);
            // Don't try to read response.text() again since it's already consumed
            throw new Error(`Failed to parse response: ${error}`);
        }
    }

    // Force logout by clearing all tokens and data
    private async forceLogout(): Promise<void> {
        try {
            console.log("Force logout triggered - clearing all tokens and data");
            await AsyncStorage.multiRemove([
                API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
                API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
                API_CONFIG.STORAGE_KEYS.USER_DATA,
            ]);
            console.log("All tokens and data cleared");
            this.onForceLogout?.(); // Notify callback
        } catch (error) {
            console.log("Error during force logout:", error);
        }
    }

    private async refreshTokenIfNeeded(response: Response, originalRequest?: RequestInit): Promise<Response> {
        // Handle all errors other than 400 (401, 403, 500, etc.)
        if (response.status !== 200 && response.status !== 400) {
            console.log(`${response.status} error detected, attempting token refresh`);
            const refreshToken = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
                try {
                    console.log("Attempting token refresh...");
                    const refreshResponse = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, refreshData.access);
                        console.log("Token refresh successful, retrying original request");
                        
                        // Retry the original request with new token
                        const newHeaders = await this.getAuthHeaders();
                        return fetch(response.url, {
                            ...originalRequest,
                            headers: newHeaders,
                        });
                    } else {
                        console.log("Token refresh failed with status:", refreshResponse.status);
                        // Force logout on refresh failure
                        await this.forceLogout();
                        throw new Error("Authentication expired. Please login again.");
                    }
                } catch (error) {
                    console.log("Token refresh failed:", error);
                    // Force logout on refresh failure
                    await this.forceLogout();
                    throw new Error("Authentication expired. Please login again.");
                }
            } else {
                console.log("No refresh token available, forcing logout");
                // Force logout if no refresh token
                await this.forceLogout();
                throw new Error("Authentication expired. Please login again.");
            }
        }
        return response;
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers = await this.getAuthHeaders();

        const requestOptions = {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        };

        console.log(`API Request: ${options.method || 'GET'} ${url}`);
        console.log('Request Headers:', headers);

        const response = await fetch(url, requestOptions);
        console.log('Response status:', response.status);
        
        // Clone the response before passing to refreshTokenIfNeeded
        const responseClone = response.clone();
        const handledResponse = await this.refreshTokenIfNeeded(responseClone, requestOptions);
        return this.handleResponse<T>(handledResponse);
    }

    // Authentication methods
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.LOGIN}`;
        console.log(`Login Request: POST ${url}`);
        console.log('Login Credentials:', { email: credentials.email, password: '***' });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        const data = await this.handleResponse<AuthResponse>(response);
        
        // Store tokens
        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.access);
        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
        
        return data;
    }

    async register(userData: RegisterRequest): Promise<UserProfile> {
        const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.REGISTER}`;
        console.log(`Register Request: POST ${url}`);
        console.log('Register Data:', { 
            email: userData.email, 
            username: userData.username, 
            register_as: userData.register_as,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone
        });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await this.handleResponse<any>(response);
        
        // Handle wrapped response structure
        let profileData: UserProfile;
        if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
            console.log('Register response wrapped in data');
            profileData = data.data;
        } else {
            console.log('Register response direct');
            profileData = data;
        }
        
        // Store user data
        await this.storeUserData(profileData);
        
        return profileData;
    }

    async getProfile(): Promise<UserProfile> {
        const response = await this.request<any>(API_CONFIG.ENDPOINTS.PROFILE);
        
        // Handle wrapped response structure
        let profileData: UserProfile;
        if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
            console.log('Profile response wrapped in data');
            profileData = response.data;
        } else {
            console.log('Profile response direct');
            profileData = response;
        }
        
        return profileData;
    }

    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        return this.request<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE, {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    }

    async logout(): Promise<void> {
        await AsyncStorage.multiRemove([
            API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
            API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
            API_CONFIG.STORAGE_KEYS.USER_DATA,
        ]);
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        return !!token;
    }

    async getStoredUserData(): Promise<UserProfile | null> {
        const userData = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    async storeUserData(userData: UserProfile): Promise<void> {
        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
}

export const apiService = new ApiService(); 