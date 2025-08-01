import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import LoadingDots from "./LoadingDots";

interface SplashScreenProps {
  visible: boolean;
}

export default function SplashScreen({ visible }: SplashScreenProps) {
  if (!visible) return null;

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Main Container */}
      <View className="items-center space-y-8">
        {/* Logo Container */}
        <View className="items-center space-y-4">
          <View className="bg-primary p-6 rounded-full shadow-lg">
            <Ionicons name="car" size={64} color="white" />
          </View>
          <Image 
            source={require('../assets/images/logo.png')}
            className="w-48 h-12"
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <View className="items-center space-y-2">
          <Text className="font-quicksand-bold text-3xl text-dark-100">
            Delivery App
          </Text>
          <Text className="font-quicksand text-gray-100 text-lg text-center">
            Fast • Reliable • Secure
          </Text>
        </View>

        {/* Loading Indicator */}
        <View className="items-center space-y-4 mt-8">
          <LoadingDots color="#FE8C00" size={12} spacing={8} />
          <Text className="font-quicksand text-gray-100 text-sm">
            Loading...
          </Text>
        </View>

        {/* Delivery Features */}
        <View className="flex-row space-x-6 mt-8">
          <View className="items-center space-y-2">
            <View className="bg-green-100 p-3 rounded-full">
              <Ionicons name="location" size={24} color="#2F9B65" />
            </View>
            <Text className="font-quicksand text-gray-100 text-xs text-center">
              Real-time Tracking
            </Text>
          </View>
          
          <View className="items-center space-y-2">
            <View className="bg-blue-100 p-3 rounded-full">
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            </View>
            <Text className="font-quicksand text-gray-100 text-xs text-center">
              Secure Delivery
            </Text>
          </View>
          
          <View className="items-center space-y-2">
            <View className="bg-orange-100 p-3 rounded-full">
              <Ionicons name="flash" size={24} color="#FE8C00" />
            </View>
            <Text className="font-quicksand text-gray-100 text-xs text-center">
              Fast Service
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="absolute bottom-8 items-center">
        <Text className="font-quicksand text-gray-100 text-sm">
          © 2024 Delivery App
        </Text>
      </View>
    </View>
  );
} 