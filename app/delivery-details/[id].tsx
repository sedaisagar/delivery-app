import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapWrapper, { Marker, Polyline, PROVIDER_GOOGLE } from '../../components/MapWrapper';
import PartnerSelector from "../../components/PartnerSelector";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/delivery";
import { DirectionsService } from "../../services/directions";
import { SyncService } from "../../services/sync";
import { DeliveryRequest, Partner } from "../../types/delivery";

interface RouteInfo {
  points: { latitude: number; longitude: number }[];
  distance: string;
  duration: string;
}

export default function DeliveryDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showPartnerSelector, setShowPartnerSelector] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Role-based access control
  const isCustomer = user?.role === "customer";
  const isDriver = user?.role === "driver";

  useEffect(() => {
    if (id) {
      loadRequestDetails();
    }
  }, [id]);

  useEffect(() => {
    if (request?.coordinates) {
      loadRoute();
    }
  }, [request]);

  const loadRequestDetails = async () => {
    if (!id) {
      console.log("No ID provided");
      Alert.alert("Error", "No delivery request ID provided.");
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      console.log("Fetching single delivery request by ID:", id);
      
      // Direct API call using the ID from the screen
      const serverRequest = await deliveryService.getDeliveryRequest(Number(id));
      console.log("Server request received:", serverRequest);
      setRequest(serverRequest);
      
    } catch (error) {
      console.log("Error fetching from server:", error);
      Alert.alert("Error", "Failed to load delivery request details. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadRoute = async () => {
    if (!request?.coordinates) return;

    setRouteLoading(true);
    try {
      // Get route (currently uses fallback since API key is not configured)
      const route = await DirectionsService.getRoute(
        request.coordinates.pickup,
        request.coordinates.dropoff
      );

      if (route) {
        setRouteInfo(route);
      } else {
        // This shouldn't happen with fallback, but just in case
        const fallbackRoute = DirectionsService.getFallbackRoute(
          request.coordinates.pickup,
          request.coordinates.dropoff
        );
        setRouteInfo(fallbackRoute);
      }
    } catch (error) {
      console.log("Error loading route:", error);
      // Use fallback route
      const fallbackRoute = DirectionsService.getFallbackRoute(
        request.coordinates.pickup,
        request.coordinates.dropoff
      );
      setRouteInfo(fallbackRoute);
    } finally {
      setRouteLoading(false);
    }
  };

  const handlePartnerSelect = async (partner: Partner) => {
    if (!request) return;

    // Only customers can assign drivers
    if (!isCustomer) {
      Alert.alert("Access Denied", "Only customers can assign drivers to deliveries.");
      return;
    }

    try {
      // Update the request with the selected partner
      await SyncService.updateRequestPartner(request.id, partner.id);
      
      // Update local state
      setRequest(prev => prev ? {
        ...prev,
        partnerId: partner.id,
        partnerName: partner.name
      } : null);
      
      setSelectedPartner(partner);
      
      Alert.alert("Success", `Driver ${partner.name} assigned to delivery`);
    } catch (error) {
      console.log("Error assigning driver:", error);
      Alert.alert("Error", "Failed to assign driver to delivery. Please try again.");
    }
  };

  const handleStatusUpdate = async (newStatus: DeliveryRequest["status"]) => {
    if (!request) return;

    // Only drivers can update status
    if (!isDriver) {
      Alert.alert("Access Denied", "Only drivers can update delivery status.");
      return;
    }

    // Drivers can only update status of requests assigned to them
    if (request.partnerId && request.partnerId !== user?.id) {
      Alert.alert("Access Denied", "You can only update status of deliveries assigned to you.");
      return;
    }

    try {
      await SyncService.updateRequestStatus(request.id, newStatus);
      
      // Update local state
      setRequest(prev => prev ? { ...prev, status: newStatus } : null);
      
      Alert.alert("Success", `Status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.log("Error updating status:", error);
      Alert.alert("Error", "Failed to update delivery status. Please try again.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-white p-8 rounded-2xl shadow-card">
          <Ionicons name="hourglass" size={64} color="#878787" />
          <Text className="font-quicksand-bold text-gray-100 text-xl mt-4 text-center">
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <View className="bg-white p-8 rounded-2xl shadow-card">
          <Ionicons name="alert-circle" size={64} color="#F14141" />
          <Text className="font-quicksand-bold text-gray-100 text-xl mt-4 text-center">
            Request not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-xl mt-6 shadow-primary"
          >
            <Text className="font-quicksand-bold text-white text-center">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-success text-white";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSyncIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case "synced":
        return <Ionicons name="checkmark-circle" size={20} color="#2F9B65" />;
      case "pending":
        return <Ionicons name="time" size={20} color="#FE8C00" />;
      case "failed":
        return <Ionicons name="close-circle" size={20} color="#F14141" />;
      default:
        return <Ionicons name="cloud-offline" size={20} color="#878787" />;
    }
  };

  // Calculate center point for map region
  const getMapRegion = () => {
    if (!request.coordinates) return null;
    
    const pickup = request.coordinates.pickup;
    const dropoff = request.coordinates.dropoff;
    
    return {
      latitude: (pickup.latitude + dropoff.latitude) / 2,
      longitude: (pickup.longitude + dropoff.longitude) / 2,
      latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 1.5 + 0.01,
      longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 1.5 + 0.01,
    };
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-header">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#181C2E" />
          </TouchableOpacity>
          <Text className="font-quicksand-bold text-xl text-dark-100">
            Delivery Details
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-8">
        <View className="space-y-8">
          {/* Status Card */}
          <View className="bg-white p-6 rounded-2xl shadow-card">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View className="bg-blue-100 p-3 rounded-full">
                  <Ionicons name="information-circle" size={24} color="#3B82F6" />
                </View>
                <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                  Status
                </Text>
              </View>
              <View className="flex-row items-center space-x-3">
                {getSyncIcon(request.syncStatus)}
                <View className={`px-4 py-2 rounded-full ${getStatusColor(request.status)}`}>
                  <Text className="font-quicksand-bold text-sm capitalize">
                    {request.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="font-quicksand text-gray-100 text-base">
                Created on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>

          {/* Map View */}
          {request.coordinates && (
            <View className="mt-5 bg-white p-6 rounded-2xl shadow-card">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center space-x-3">
                  <View className="bg-green-100 p-3 rounded-full">
                    <Ionicons name="map" size={24} color="#2F9B65" />
                  </View>
                  <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                    Route Map
                  </Text>
                </View>
                {routeLoading && (
                  <View className="flex-row items-center space-x-2">
                    <Ionicons name="refresh" size={16} color="#878787" />
                    <Text className="font-quicksand text-gray-100 text-sm">
                      Loading route...
                    </Text>
                  </View>
                )}
              </View>
              <View className="h-64 rounded-xl overflow-hidden">
                <MapWrapper
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={getMapRegion()}
                >
                  {/* Pickup Marker */}
                  <Marker
                    coordinate={request.coordinates.pickup}
                    title="Pickup Location"
                    description={request.pickupAddress}
                    pinColor="#FE8C00"
                  />
                  
                  {/* Dropoff Marker */}
                  <Marker
                    coordinate={request.coordinates.dropoff}
                    title="Dropoff Location"
                    description={request.dropoffAddress}
                    pinColor="#2F9B65"
                  />
                  
                  {/* Route Line */}
                  {routeInfo && (
                    <Polyline
                      coordinates={routeInfo.points}
                      strokeColor="#3B82F6"
                      strokeWidth={4}
                      lineDashPattern={[10, 5]}
                    />
                  )}
                </MapWrapper>
              </View>
              
              {/* Route Info */}
              <View className="mt-4 bg-blue-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3 mb-2">
                  <Ionicons name="navigate" size={20} color="#3B82F6" />
                  <Text className="font-quicksand-bold text-blue-800 text-base">
                    Delivery Route
                  </Text>
                </View>
                <Text className="font-quicksand text-blue-700 text-sm mb-2">
                  Orange marker: Pickup • Green marker: Dropoff • Blue line: Route
                </Text>
                {routeInfo && (
                  <View className="space-y-2">
                    <View className="flex-row space-x-4">
                      <View className="flex-row items-center space-x-1">
                        <Ionicons name="car" size={16} color="#3B82F6" />
                        <Text className="font-quicksand-bold text-blue-800 text-sm">
                          {routeInfo.distance}
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <Ionicons name="time" size={16} color="#3B82F6" />
                        <Text className="font-quicksand-bold text-blue-800 text-sm">
                          {routeInfo.duration}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-2 bg-yellow-50 p-2 rounded-lg">
                      <View className="flex-row items-center space-x-1">
                        <Ionicons name="information-circle" size={14} color="#F59E0B" />
                        <Text className="font-quicksand text-yellow-800 text-xs">
                          Simulated route (configure Google Directions API for real routes)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Customer Information */}
          <View className="bg-white p-6 rounded-2xl shadow-card mt-5">
            <View className="flex-row items-center space-x-3 mb-6">
              <View className="bg-purple-100 p-3 rounded-full">
                <Ionicons name="person" size={24} color="#8B5CF6" />
              </View>
              <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                Customer Information
              </Text>
            </View>
            <View className="space-y-4">
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3">
                  <Ionicons name="person" size={20} color="#878787" />
                  <Text className="ml-2 font-quicksand-bold text-dark-100 text-base">
                    {request.customerName}
                  </Text>
                </View>
              </View>
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3">
                  <Ionicons name="call" size={20} color="#878787" />
                  <Text className="ml-2 font-quicksand-bold text-dark-100 text-base">
                    {request.customerPhone}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pickup Location */}
          <View className="bg-white p-6 rounded-2xl shadow-card">
            <View className="flex-row items-center space-x-3 mb-6">
              <View className="bg-orange-100 p-3 rounded-full">
                <Ionicons name="location" size={24} color="#FE8C00" />
              </View>
              <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                Pickup Location
              </Text>
            </View>
            <View className="bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-start space-x-3">
                <Ionicons name="location" size={20} color="#FE8C00" />
                <Text className="ml-2 font-quicksand text-dark-100 text-base flex-1 leading-6">
                  {request.pickupAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Dropoff Location */}
          <View className="mt-5 bg-white p-6 rounded-2xl shadow-card">
            <View className="flex-row items-center space-x-3 mb-6">
              <View className="bg-green-100 p-3 rounded-full">
                <Ionicons name="location" size={24} color="#2F9B65" />
              </View>
              <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                Dropoff Location
              </Text>
            </View>
            <View className="bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-start space-x-3">
                <Ionicons name="location" size={20} color="#2F9B65" />
                <Text className="ml-2 font-quicksand text-dark-100 text-base flex-1 leading-6">
                  {request.dropoffAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Note */}
          {request.deliveryNote && request.deliveryNote.trim() !== "" && (
            <View className="bg-white p-6 rounded-2xl shadow-card mt-5">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-blue-100 p-3 rounded-full">
                  <Ionicons name="document-text" size={24} color="#3B82F6" />
                </View>
                <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                  Delivery Note
                </Text>
              </View>
              <View className="bg-blue-50 p-4 rounded-xl">
                <View className="flex-row items-start space-x-3">
                  <Ionicons name="document-text" size={20} color="#3B82F6" />
                  <Text className="ml-2 font-quicksand text-dark-100 text-base flex-1 leading-6">
                    {request.deliveryNote}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Driver Assignment - Only visible to customers and only when no driver is assigned */}
          {isCustomer && !request.driverName && !request.driverEmail && (
            <View className="bg-white p-6 rounded-2xl shadow-card mt-5">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-yellow-100 p-3 rounded-full">
                  <Ionicons name="car" size={24} color="#F59E0B" />
                </View>
                <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                  Driver Assignment
                </Text>
              </View>
              
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3">
                  <Ionicons name="car-outline" size={20} color="#878787" />
                  <Text className="ml-2 font-quicksand text-gray-100 text-base">
                    No driver assigned
                  </Text>
                </View>
                <Text className="ml-8 font-quicksand text-gray-100 text-sm mt-1">
                  Select a driver to assign to this delivery
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setShowPartnerSelector(true)}
                className="bg-primary mt-4 p-4 rounded-xl"
                style={{
                  shadowColor: "#FE8C00",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-center space-x-2">
                  <Ionicons name="car" size={20} color="white" />
                  <Text className="font-quicksand-bold text-white text-base">
                    Assign Driver
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Driver Information - Show when driver is assigned */}
          {(request.driverName || request.driverEmail) && (
            <View className="bg-white p-6 rounded-2xl shadow-card mt-5">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-green-100 p-3 rounded-full">
                  <Ionicons name="car" size={24} color="#2F9B65" />
                </View>
                <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                  Assigned Driver
                </Text>
              </View>
              
              <View className="space-y-4">
                {request.driverName && (
                  <View className="bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center space-x-3">
                      <Ionicons name="person" size={20} color="#2F9B65" />
                      <Text className="ml-2 font-quicksand-bold text-dark-100 text-base">
                        {request.driverName}
                      </Text>
                    </View>
                  </View>
                )}
                
                {request.driverEmail && (
                  <View className="bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center space-x-3">
                      <Ionicons name="mail" size={20} color="#2F9B65" />
                      <Text className="ml-2 font-quicksand text-dark-100 text-base">
                        {request.driverEmail}
                      </Text>
                    </View>
                  </View>
                )}
                
                {request.assignedAt && (
                  <View className="bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center space-x-3">
                      <Ionicons name="time" size={20} color="#2F9B65" />
                      <Text className="ml-2 font-quicksand text-dark-100 text-base">
                        Assigned on {new Date(request.assignedAt).toLocaleDateString()} at {new Date(request.assignedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </View>
                )}
                
                {request.assignedByEmail && (
                  <View className="bg-green-50 p-4 rounded-xl">
                    <View className="flex-row items-center space-x-3">
                      <Ionicons name="person-circle" size={20} color="#2F9B65" />
                      <Text className="ml-2 font-quicksand text-dark-100 text-base">
                        Assigned by: {request.assignedByEmail}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Action Buttons - Role-based access */}
          {(() => {
            // Check if there are any actions available
            const hasActions = isDriver && (
              request.status === "pending" ||
              request.status === "assigned" ||
              request.status === "in_progress" ||
              (request.status !== "completed" && request.status !== "cancelled")
            );
            
            if (!hasActions) return null;
            
            return (
              <View className="bg-white p-6 rounded-2xl shadow-card mt-5">
                <View className="flex-row items-center space-x-3 mb-6">
                  <View className="bg-red-100 p-3 rounded-full">
                    <Ionicons name="settings" size={24} color="#EF4444" />
                  </View>
                  <Text className="ml-5 font-quicksand-bold text-dark-100 text-xl">
                    Actions
                  </Text>
                </View>
                
                {/* Only drivers can update status */}
                {isDriver ? (
                  <View className="space-y-3">
                    {request.status === "pending" && (
                      <TouchableOpacity
                        onPress={() => handleStatusUpdate("assigned")}
                        className="bg-blue-500 p-4 rounded-xl"
                        style={{
                          shadowColor: "#3B82F6",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center justify-center space-x-2">
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                          <Text className="font-quicksand-bold text-white text-base">
                            Accept Assignment
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {request.status === "assigned" && (
                      <TouchableOpacity
                        onPress={() => handleStatusUpdate("in_progress")}
                        className="bg-blue-500 p-4 rounded-xl"
                        style={{
                          shadowColor: "#3B82F6",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center justify-center space-x-2">
                          <Ionicons name="play" size={20} color="white" />
                          <Text className="font-quicksand-bold text-white text-base">
                            Start Delivery
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {request.status === "in_progress" && (
                      <TouchableOpacity
                        onPress={() => handleStatusUpdate("completed")}
                        className="bg-success p-4 rounded-xl"
                        style={{
                          shadowColor: "#2F9B65",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center justify-center space-x-2">
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text className="font-quicksand-bold text-white text-base">
                            Mark as Completed
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {request.status !== "completed" && request.status !== "cancelled" && (
                      <TouchableOpacity
                        onPress={() => handleStatusUpdate("cancelled")}
                        className="bg-red-500 p-4 rounded-xl"
                        style={{
                          shadowColor: "#EF4444",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center justify-center space-x-2">
                          <Ionicons name="close" size={20} color="white" />
                          <Text className="font-quicksand-bold text-white text-base">
                            Cancel Delivery
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  /* Customers and admins see read-only message */
                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row items-center space-x-3">
                      <Ionicons name="information-circle" size={20} color="#878787" />
                      <Text className="ml-2 font-quicksand text-gray-100 text-base">
                        {isCustomer 
                          ? "Only assigned drivers can update delivery status" 
                          : "Status updates are restricted to assigned drivers"
                        }
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })()}

          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Partner Selector Modal - Only for customers */}
      {isCustomer && (
        <PartnerSelector
          visible={showPartnerSelector}
          onClose={() => setShowPartnerSelector(false)}
          onSelectPartner={handlePartnerSelect}
          selectedPartnerId={request.partnerId}
          location={request.pickupAddress}
        />
      )}
    </View>
  );
} 