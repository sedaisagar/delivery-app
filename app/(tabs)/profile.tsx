import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import CustomRefreshControl from "../../components/RefreshControl";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/delivery";
import { StorageService } from "../../services/storage";
import { SyncService } from "../../services/sync";
import { Statistics } from "../../types/delivery";

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Statistics>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    inProgressDeliveries: 0,
    assignedDeliveries: 0,
    todayCompleted: 0,
    todayPending: 0,
    weekCompleted: 0,
    monthCompleted: 0,
    period: "all"
  });
  const { user, logout } = useAuth();

  // Load stats when component mounts
  useEffect(() => {
    loadStats();
  }, []);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const statistics = await deliveryService.getStatistics("all", user?.role as "customer" | "driver");
      setStats(statistics);
      console.log("Loaded profile statistics:", statistics);
    } catch (error) {
      console.log("Error loading statistics:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await SyncService.forceSync();
      await loadStats();
    } catch (error) {
      console.log("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Check for pending sync data
      const pendingSync = await StorageService.getPendingSync();
      const deliveryRequests = await StorageService.getDeliveryRequests();
      
      if (pendingSync.length > 0 || deliveryRequests.length > 0) {
        Alert.alert(
          "Logout Warning",
          "You have pending sync data and local delivery requests. Logging out will clear all this data. Are you sure you want to continue?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Logout",
              style: "destructive",
              onPress: async () => {
                try {
                  await logout();
                } catch (error) {
                  console.log("Error during logout:", error);
                  Alert.alert("Error", "Failed to logout. Please try again.");
                }
              },
            },
          ]
        );
      } else {
        try {
          await logout();
        } catch (error) {
          console.log("Error during logout:", error);
          Alert.alert("Error", "Failed to logout. Please try again.");
        }
      }
    } catch (error) {
      console.log("Error checking pending sync:", error);
      // Fallback to simple logout if we can't check pending data
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.log("Logout error:", error);
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <CustomRefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-8" style={{
        shadowColor: "#9CA3AF",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      }}>
        <View className="flex-row items-center space-x-4 mb-6 mt-5">
          <View className="bg-primary p-4 rounded-full">
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View className="flex-1 ml-5">
            <Text className="font-quicksand-bold text-dark-100 text-2xl mb-1">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.username || "User"
              }
            </Text>
            <Text className="font-quicksand text-gray-100 text-base">
              {user?.role === "driver" ? "Delivery Driver" : "Customer"}
            </Text>
            <Text className="font-quicksand text-gray-100 text-sm">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="space-y-4">
          <View className="bg-white p-6 rounded-2xl" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View className="bg-blue-100 p-3 rounded-full">
                  <Ionicons name="list" size={24} color="#3B82F6" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Total Requests
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    All time deliveries
                  </Text>
                </View>
              </View>
              <Text className="font-quicksand-bold text-blue-600 text-3xl">
                {stats.totalDeliveries}
              </Text>
            </View>
            <View className="bg-blue-50 p-3 rounded-xl">
              <Text className="font-quicksand text-blue-800 text-sm text-center">
                {stats.totalDeliveries > 0
                  ? `${stats.totalDeliveries} request${stats.totalDeliveries !== 1 ? 's' : ''} total`
                  : "No requests yet"
                }
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-4 mt-5">
            <View className="flex-1 bg-white p-6 rounded-2xl" style={{
              shadowColor: "#6B7280",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <View className="flex-row items-center space-x-3 mb-4">
                <View className="bg-green-100 p-3 rounded-full">
                  <Ionicons name="checkmark-circle" size={20} color="#2F9B65" />
                </View>
                <View className="flex-1 ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Completed
                  </Text>
                </View>
              </View>
              <View className="ml-2">
                <Text className="font-quicksand-bold text-success text-2xl mb-2">
                  {stats.completedDeliveries}
                </Text>
                <Text className="font-quicksand text-gray-100 text-sm">
                  Successfully delivered
                </Text>
              </View>
            </View>

            <View className="flex-1 bg-white p-6 rounded-2xl ml-2" style={{
              shadowColor: "#6B7280",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <View className="flex-row items-center mb-4">
                <View className=" bg-yellow-100 p-3 rounded-full">
                  <Ionicons name="time" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Pending
                  </Text>
                </View>
              </View>
              <View className="ml-2">
                <Text className="font-quicksand-bold text-yellow-600 text-2xl mb-2">
                  {stats.pendingDeliveries}
                </Text>
                <Text className="font-quicksand text-gray-100 text-sm">
                  In progress
                </Text>

              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View className="px-6 py-8">
        <Text className="font-quicksand-bold text-dark-100 text-2xl mb-6">
          Settings
        </Text>

        <View className="space-y-4">
          <TouchableOpacity className="bg-white p-6 rounded-2xl" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="person-circle" size={24} color="#8B5CF6" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Edit Profile
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Update your information
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#878787" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-6 rounded-2xl mt-5" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="bg-blue-100 p-3 rounded-full">
                  <Ionicons name="notifications" size={24} color="#3B82F6" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Notifications
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Manage your alerts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#878787" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-6 rounded-2xl mt-5" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="bg-green-100 p-3 rounded-full">
                  <Ionicons name="shield-checkmark" size={24} color="#2F9B65" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Privacy & Security
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Manage your privacy
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#878787" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-6 rounded-2xl mt-5" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="bg-orange-100 p-3 rounded-full">
                  <Ionicons name="help-circle" size={24} color="#FE8C00" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Help & Support
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Get help when needed
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#878787" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Section */}
      <View className="px-6 pb-8">
        <Text className="font-quicksand-bold text-dark-100 text-2xl ">
          Actions
        </Text>
        <TouchableOpacity className="bg-white p-6 rounded-2xl mt-5" style={{
          shadowColor: "#6B7280",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }} onPress={handleLogout}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <View className="bg-red-100 p-3 rounded-full">
                <Ionicons name="log-out" size={24} color="#EF4444" />
              </View>
              <View className="ml-5">
                <Text className="font-quicksand-bold text-dark-100 text-lg">
                  Logout
                </Text>
                <Text className="font-quicksand text-gray-100 text-sm">
                  Sign out of your account
                </Text>
              </View>
            </View>
            <Ionicons name="log-out" size={20} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 