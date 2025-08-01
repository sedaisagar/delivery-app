import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService, UserProfile } from "../services/api";
import { StorageService } from "../services/storage";

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    forceLogout: () => Promise<void>;
    updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
        // Set up force logout callback for API service
        apiService.setForceLogoutCallback(() => {
            console.log("Force logout callback triggered from API service");
            forceLogout();
        });
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log("Checking authentication status...");
            const authenticated = await apiService.isAuthenticated();
            console.log("Is authenticated:", authenticated);
            setIsAuthenticated(authenticated);

            if (authenticated) {
                // Try to get user profile from API
                try {
                    const profile = await apiService.getProfile();
                    setUser(profile);
                    await apiService.storeUserData(profile);
                    console.log("User profile loaded:", profile);
                } catch (error: any) {
                    console.log("Failed to get profile from API:", error);
                    // If we can't get the profile, we're not authenticated
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                console.log("Not authenticated, ensuring logout state");
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log("Error checking auth status:", error);
            // Don't auto logout on any error
            console.log("Auth check error, but not logging out");
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            // setIsLoading(true);
            await apiService.login({ email, password });
            
            // Get user profile after successful login
            const profile = await apiService.getProfile();
            
            // Block admin users from logging into the mobile app
            if (profile.role === "admin") {
                await apiService.logout(); // Clear tokens
                throw new Error("Admin users cannot login through the mobile app. Please use the web dashboard.");
            }
            
            setUser(profile);
            await apiService.storeUserData(profile);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.log("Login error:", error);
            setIsAuthenticated(false); // Ensure state is false on error
            setUser(null); // Ensure user is null on error
            if (error.message && error.message.includes("400")) { throw error; }
            throw error;
        } finally {
            // setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        try {
            // setIsLoading(true);
            const profile = await apiService.register(userData);
            
            // Block admin users from registering through the mobile app
            if (profile.role === "admin") {
                await apiService.logout(); // Clear tokens
                throw new Error("Admin users cannot register through the mobile app. Please use the web dashboard.");
            }
            
            setUser(profile);
            await apiService.storeUserData(profile);
            // setIsAuthenticated(true);
        } catch (error: any) {
            console.log("Register error:", error);
            setIsAuthenticated(false); // Ensure state is false on error
            setUser(null); // Ensure user is null on error
            if (error.message && error.message.includes("400")) { throw error; }
            throw error;
        } finally {
            // setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            console.log("Starting logout process...");
            
            // Clear all pending sync data
            console.log("Clearing pending sync data...");
            await StorageService.clearPendingSync();
            
            // Clear all delivery requests
            console.log("Clearing delivery requests...");
            await StorageService.saveDeliveryRequests([]);
            
            // Clear user data
            console.log("Clearing user data...");
            await StorageService.clearAllData();
            
            // Clear API tokens
            console.log("Clearing API tokens...");
            await apiService.logout();
            
            // Reset auth state
            setUser(null);
            setIsAuthenticated(false);
            
            console.log("Logout completed successfully");
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    // Force logout (called when API authentication fails)
    const forceLogout = async () => {
        try {
            console.log("Force logout called from AuthContext");
            await apiService.logout();
            setUser(null);
            setIsAuthenticated(false);
            console.log("Force logout completed");
        } catch (error) {
            console.log("Force logout error:", error);
        }
    };

    // Clear auth state without logout (for 400 errors)
    const clearAuthState = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (profileData: Partial<UserProfile>) => {
        try {
            const updatedProfile = await apiService.updateProfile(profileData);
            setUser(updatedProfile);
            await apiService.storeUserData(updatedProfile);
        } catch (error) {
            console.log("Update profile error:", error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        forceLogout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 