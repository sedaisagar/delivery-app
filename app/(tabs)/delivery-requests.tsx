import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import CustomRefreshControl from "../../components/RefreshControl";
import { SyncService } from "../../services/sync";
import { DeliveryRequest } from "../../types/delivery";

export default function DeliveryRequestsScreen() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await SyncService.getDeliveryRequests();
      setRequests(requests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force sync when pulling to refresh
      await SyncService.forceSync();
      await loadRequests();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-success text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSyncIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case "synced":
        return <Ionicons name="checkmark-circle" size={18} color="#2F9B65" />;
      case "pending":
        return <Ionicons name="time" size={18} color="#FE8C00" />;
      case "failed":
        return <Ionicons name="close-circle" size={18} color="#F14141" />;
      default:
        return <Ionicons name="cloud-offline" size={18} color="#878787" />;
    }
  };

  const renderRequest = ({ item }: { item: DeliveryRequest }) => (
    <TouchableOpacity
      onPress={() => router.push(`/delivery-details/${item.id}`)}
      className="bg-white p-6 rounded-2xl mb-4 mx-4"
      style={{
        shadowColor: "#6B7280",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* Header with customer info and status */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Text className="font-quicksand-bold text-dark-100 text-xl mb-2">
            {item.customerName}
          </Text>
          <View className="flex-row items-center space-x-2">
            <Ionicons name="call" size={16} color="#878787" />
            <Text className="font-quicksand text-gray-100 text-base">
              {item.customerPhone}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-3">
          {getSyncIcon(item.syncStatus)}
          <View className={`px-3 py-2 rounded-full ${getStatusColor(item.status)}`}>
            <Text className="font-quicksand-bold text-xs capitalize">
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </View>

      {/* Addresses section */}
      <View className="space-y-4 mb-4">
        <View className="bg-gray-50 p-4 rounded-xl">
          <View className="flex-row items-start space-x-3">
            <View className="bg-orange-100 p-2 rounded-full">
              <Ionicons name="location" size={18} color="#FE8C00" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-dark-100 text-sm mb-1">
                Pickup Location
              </Text>
              <Text className="font-quicksand text-gray-100 text-sm leading-5">
                {item.pickupAddress}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gray-50 p-4 rounded-xl">
          <View className="flex-row items-start space-x-3">
            <View className="bg-green-100 p-2 rounded-full">
              <Ionicons name="location" size={18} color="#2F9B65" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-dark-100 text-sm mb-1">
                Dropoff Location
              </Text>
              <Text className="font-quicksand text-gray-100 text-sm leading-5">
                {item.dropoffAddress}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Delivery note if exists */}
      {item.deliveryNote && (
        <View className="bg-blue-50 p-4 rounded-xl">
          <View className="flex-row items-start space-x-3">
            <Ionicons name="document-text" size={18} color="#3B82F6" />
            <View className="flex-1">
              <Text className="font-quicksand-bold text-dark-100 text-sm mb-1">
                Delivery Note
              </Text>
              <Text className="font-quicksand text-gray-100 text-sm leading-5">
                {item.deliveryNote}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Date and time */}
      <View className="mt-4 pt-4 border-t border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="calendar" size={16} color="#878787" />
            <Text className="font-quicksand text-gray-100 text-sm">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <Ionicons name="time" size={16} color="#878787" />
            <Text className="font-quicksand text-gray-100 text-sm">
              {new Date(item.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6" style={{
        shadowColor: "#9CA3AF",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-quicksand-bold text-2xl text-dark-100 mb-1">
              Delivery Requests
            </Text>
            <Text className="font-quicksand text-gray-100 text-base">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/new-delivery")}
            className="bg-primary p-3 rounded-full"
            style={{
              shadowColor: "#FE8C00",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <CustomRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16 px-6">
            <View className="bg-white p-8 rounded-2xl" style={{
              shadowColor: "#6B7280",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <View className="bg-gray-100 p-6 rounded-full self-center mb-6">
                <Ionicons name="list" size={48} color="#878787" />
              </View>
              <Text className="font-quicksand-bold text-gray-100 text-xl text-center mb-3">
                No requests yet
              </Text>
              <Text className="font-quicksand text-gray-100 text-center text-base leading-6 mb-8">
                Create your first delivery request to get started with managing deliveries
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/new-delivery")}
                className="bg-primary px-8 py-4 rounded-xl"
                style={{
                  shadowColor: "#FE8C00",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="font-quicksand-bold text-white text-center text-lg">
                  Create Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
} 