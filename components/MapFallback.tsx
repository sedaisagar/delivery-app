import React from 'react';
import { Text, View } from 'react-native';

interface MapFallbackProps {
  message?: string;
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function MapFallback({ message = "Maps are not available on this platform", style, children, ...props }: MapFallbackProps) {
  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }, style]} {...props}>
      <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#666' }}>
          🗺️ {message}
        </Text>
        {children}
      </View>
    </View>
  );
}

// Export mock components for react-native-maps compatibility
export const Marker = () => null;
export const Polyline = () => null;
export const PROVIDER_GOOGLE = null;
export const MapView = MapFallback; 