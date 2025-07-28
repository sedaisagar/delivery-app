import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import CustomRefreshControl from "../../components/RefreshControl";
import { SyncService } from "../../services/sync";

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const requests = await SyncService.getDeliveryRequests();
      const total = requests.length;
      const completed = requests.filter(req => req.status === "completed").length;
      const pending = requests.filter(req => req.status === "pending" || req.status === "in_progress").length;

      setStats({
        totalRequests: total,
        completedRequests: completed,
        pendingRequests: pending,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await SyncService.forceSync();
      await loadStats();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
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
          onPress: () => {
            // TODO: Implement logout logic
            Alert.alert("Success", "Logged out successfully");
          },
        },
      ]
    );
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
              John Doe
            </Text>
            <Text className="font-quicksand text-gray-100 text-base">
              Delivery Manager
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
                {stats.totalRequests}
              </Text>
            </View>
            <View className="bg-blue-50 p-3 rounded-xl">
              <Text className="font-quicksand text-blue-800 text-sm text-center">
                {stats.totalRequests > 0
                  ? `${stats.totalRequests} request${stats.totalRequests !== 1 ? 's' : ''} total`
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
                  {stats.completedRequests}
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
                  {stats.pendingRequests}
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