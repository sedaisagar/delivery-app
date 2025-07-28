import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface MapFallbackProps {
  message?: string;
}

export default function MapFallback({ message = "Maps not available" }: MapFallbackProps) {
  return (
    <View className="flex-1 bg-gray-100 items-center justify-center">
      <Ionicons name="map" size={64} color="#878787" />
      <Text className="font-quicksand text-gray-100 text-lg mt-4 text-center">
        {message}
      </Text>
      <Text className="font-quicksand text-gray-100 text-sm mt-2 text-center">
        Location services may not be available on this device
      </Text>
    </View>
  );
} 