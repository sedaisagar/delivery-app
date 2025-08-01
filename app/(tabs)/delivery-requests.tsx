import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import CustomRefreshControl from "../../components/RefreshControl";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/delivery";
import { SyncService } from "../../services/sync";
import { DeliveryRequest } from "../../types/delivery";

export default function DeliveryRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load requests when component mounts
  useEffect(() => {
    loadRequests(true); // Reset to first page
  }, []);

  // Remove useFocusEffect to prevent page 1 being called every time

  const loadRequests = async (reset: boolean = false) => {
    try {
      let pageToLoad = currentPage;
      
      if (reset) {
        setIsLoading(true);
        setCurrentPage(1);
        setRequests([]);
        pageToLoad = 1; // Use page 1 for the API call
      } else {
        setLoadingMore(true);
      }

      let response;
      if (user?.role === "driver") {
        response = await deliveryService.getAssignedDeliveryRequests(pageToLoad);
      } else {
        response = await deliveryService.getDeliveryRequests(pageToLoad);
      }

      const newRequests = response.results || [];
      
      // Set hasMore based on next field
      setHasMore(!!response.next);
      
      if (reset) {
        setRequests(newRequests);
        setTotalCount(response.count || 0);
      } else {
        setRequests(prev => [...prev, ...newRequests]);
      }

      setCurrentPage(prev => prev + 1);
      
    } catch (error) {
      console.log("Error loading requests:", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force sync when pulling to refresh
      await SyncService.forceSync();
      // Reset to first page and clear existing items
      setRequests([]);
      setCurrentPage(1);
      setHasMore(true);
      await loadRequests(true); // Reset to first page
    } catch (error) {
      console.log("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadRequests(false); // Load next page
    }
  };

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
        return <Ionicons name="checkmark-circle" size={18} color="#2F9B65" />;
      case "pending":
        return <Ionicons name="time" size={18} color="#FE8C00" />;
      case "failed":
        return <Ionicons name="close-circle" size={18} color="#F14141" />;
      default:
        return <Ionicons name="cloud-offline" size={18} color="#878787" />;
    }
  };

  const getRoleSpecificTitle = () => {
    if (user?.role === "driver") {
      return "Assigned Deliveries";
    }
    return "My Delivery Requests";
  };

  const getRoleSpecificSubtitle = () => {
    if (user?.role === "driver") {
      if (totalCount > 0) {
        return `${requests.length} of ${totalCount} delivery${totalCount !== 1 ? 's' : ''} assigned to you`;
      }
      return `${requests.length} delivery${requests.length !== 1 ? 's' : ''} assigned to you`;
    }
    if (totalCount > 0) {
      return `${requests.length} of ${totalCount} request${totalCount !== 1 ? 's' : ''}`;
    }
    return `${requests.length} request${requests.length !== 1 ? 's' : ''}`;
  };

  const getRoleSpecificEmptyMessage = () => {
    if (user?.role === "driver") {
      return {
        title: "No deliveries assigned",
        message: "You don't have any deliveries assigned to you yet. Pull down to refresh or tap the button below to check for new assignments.",
        actionText: "Check for Assignments"
      };
    }
    return {
      title: "No requests yet",
      message: "Create your first delivery request to get started with managing deliveries",
      actionText: "Create Request"
    };
  };

  const handleCreateRequest = () => {
    if (user?.role === "driver") {
      Alert.alert("Driver Action", "Drivers cannot create delivery requests. You can only view and update assigned deliveries.");
      return;
    }
    router.push("/new-delivery");
  };

  const handleEmptyStateAction = () => {
    if (user?.role === "driver") {
      // For drivers, refresh to check for new assignments
      onRefresh();
    } else {
      // For customers, create new request
      handleCreateRequest();
    }
  };

  const renderRequest = ({ item }: { item: DeliveryRequest }) => {
    
    return (
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
};

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
              {getRoleSpecificTitle()}
            </Text>
            <Text className="font-quicksand text-gray-100 text-base">
              {getRoleSpecificSubtitle()}
            </Text>
          </View>
          <View className="flex-row space-x-2">
            {user?.role !== "driver" && (
              <TouchableOpacity
                onPress={handleCreateRequest}
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
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item,index) => `${index}-${item.id}-${item.createdAt}`}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <CustomRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && requests.length > 0 ? (
            <View className="py-6 px-6">
              <View className="flex-row items-center justify-center space-x-3">
                <View className="animate-spin">
                  <Ionicons name="refresh" size={20} color="#878787" />
                </View>
                <Text className="font-quicksand text-gray-100 text-center text-sm">
                  Loading more deliveries...
                </Text>
              </View>
            </View>
          ) : !hasMore && requests.length > 0 ? (
            <View className="py-6 px-6">
              <Text className="font-quicksand text-gray-100 text-center text-sm">
                No more deliveries to load
              </Text>
            </View>
          ) : null
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
                {getRoleSpecificEmptyMessage().title}
              </Text>
              <Text className="font-quicksand text-gray-100 text-center text-base leading-6 mb-8">
                {getRoleSpecificEmptyMessage().message}
              </Text>
              <TouchableOpacity
                onPress={handleEmptyStateAction}
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
                  {getRoleSpecificEmptyMessage().actionText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
} 