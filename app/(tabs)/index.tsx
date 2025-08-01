import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CustomRefreshControl from "../../components/RefreshControl";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/delivery";
import { SyncService } from "../../services/sync";
import { Statistics } from "../../types/delivery";

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "today" | "week" | "month">("all");
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

  const isDriver = user?.role === "driver";
  const isCustomer = user?.role === "customer";

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
      const statistics = await deliveryService.getStatistics(selectedPeriod, user?.role as "customer" | "driver");
      setStats(statistics);
      console.log("Loaded statistics:", statistics);
    } catch (error) {
      console.log("Error loading statistics:", error);
    }
  };

  const handlePeriodChange = (period: "all" | "today" | "week" | "month") => {
    setSelectedPeriod(period);
    loadStats();
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

  const handleCreateRequest = () => {
    if (isDriver) {
      return; // Drivers cannot create requests
    }
    router.push("/new-delivery");
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
        <View className="mb-6">
          <Text className="font-quicksand-bold text-3xl text-dark-100 mb-2">
            Welcome back!
          </Text>
          <Text className="font-quicksand text-gray-100 text-lg">
            {isDriver ? "Manage your assigned deliveries" : "Manage your delivery requests"}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="space-y-4">
          {isCustomer && (
            <TouchableOpacity
              onPress={handleCreateRequest}
              className="bg-primary p-6 rounded-2xl"
              style={{
                shadowColor: "#FE8C00",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-white text-xl mb-2">
                    New Delivery Request
                  </Text>
                  <Text className="font-quicksand text-white/90 text-base">
                    Create a new delivery request
                  </Text>
                </View>
                <View className="bg-white/20 p-3 rounded-full">
                  <Ionicons name="add" size={24} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {isDriver && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/delivery-requests")}
              className="bg-blue-500 p-6 rounded-2xl"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-white text-xl mb-2">
                    View My Assignments
                  </Text>
                  <Text className="font-quicksand text-white/90 text-base">
                    Check your assigned delivery requests
                  </Text>
                </View>
                <View className="bg-white/20 p-3 rounded-full">
                  <Ionicons name="list" size={24} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/delivery-requests")}
            className="bg-white p-6 rounded-2xl mt-5"
            style={{
              shadowColor: "#6B7280",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-quicksand-bold text-dark-100 text-xl mb-2">
                  View All Requests
                </Text>
                <Text className="font-quicksand text-gray-100 text-base">
                  Manage your delivery requests
                </Text>
              </View>
              <View className="bg-gray-100 p-3 rounded-full">
                <Ionicons name="list" size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Statistics Period Selector */}
          <View className="bg-white p-4 rounded-2xl mt-5" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="font-quicksand-bold text-dark-100 text-lg mb-3">
              Statistics Period
            </Text>
            <View className="flex-row space-x-2">
                {(["all", "today", "week", "month"] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => handlePeriodChange(period)}
                  className={`flex-1 py-2 px-3 me-2 rounded-lg ${
                    selectedPeriod === period
                      ? "bg-primary"
                      : "border-primary border-2 border-solid"
                  }`}
                >
                  <Text
                    className={`font-quicksand-bold text-center text-sm ${
                      selectedPeriod === period
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </View>

      {/* Stats Section */}
      <View className="px-6 py-8">
        <Text className="font-quicksand-bold text-dark-100 text-2xl mb-6">
          Quick Stats
        </Text>
        
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
                <View className="bg-orange-100 p-3 rounded-full">
                  <Ionicons name="time" size={24} color="#FE8C00" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Active Requests
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Currently in progress
                  </Text>
                </View>
              </View>
              <Text className="font-quicksand-bold text-primary text-3xl">
                {stats.inProgressDeliveries}
              </Text>
            </View>
            <View className="bg-orange-50 p-3 rounded-xl">
              <Text className="font-quicksand text-orange-800 text-sm text-center">
                {stats.inProgressDeliveries > 0 
                  ? `${stats.inProgressDeliveries} request${stats.inProgressDeliveries !== 1 ? 's' : ''} in progress`
                  : "No active requests"
                }
              </Text>
            </View>
          </View>

          <View className="bg-white p-6 rounded-2xl mt-5" style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View className="bg-green-100 p-3 rounded-full">
                  <Ionicons name="checkmark-circle" size={24} color="#2F9B65" />
                </View>
                <View className="ml-5">
                  <Text className="font-quicksand-bold text-dark-100 text-lg">
                    Completed
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-sm">
                    Successfully delivered
                  </Text>
                </View>
              </View>
              <Text className="font-quicksand-bold text-success text-3xl">
                {stats.completedDeliveries}
              </Text>
            </View>
            <View className="bg-green-50 p-3 rounded-xl">
              <Text className="font-quicksand text-green-800 text-sm text-center">
                {stats.completedDeliveries > 0 
                  ? `${stats.completedDeliveries} delivery${stats.completedDeliveries !== 1 ? 'ies' : 'y'} completed`
                  : "No completed deliveries yet"
                }
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-6 pb-8">
        <Text className="font-quicksand-bold text-dark-100 text-2xl mb-6">
          Recent Activity
        </Text>
        
        <View className="bg-white p-6 rounded-2xl" style={{
          shadowColor: "#6B7280",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}>
          <View className="flex-row items-center space-x-3 mb-4">
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="notifications" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-5"> 
              <Text className="font-quicksand-bold text-dark-100 text-lg">
                Stay Updated
              </Text>
              <Text className="font-quicksand text-gray-100 text-sm">
                Track your delivery progress
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/delivery-requests")}
            className="bg-blue-50 p-4 rounded-xl"
          >
            <Text className="font-quicksand-bold text-blue-800 text-base text-center">
              View All Activity
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 