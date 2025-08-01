import React from 'react';
import { Text, View } from 'react-native';

// Web-compatible MapView component
function WebMapView({ children, style, ...props }: any) {
  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }, style]} {...props}>
      <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#666' }}>
          🗺️ Maps are not available on web platform
        </Text>
        {children}
      </View>
    </View>
  );
}

// Mock components that do nothing
const MockMarker = () => null;
const MockPolyline = () => null;
const MockCallout = () => null;
const MockCircle = () => null;
const MockPolygon = () => null;
const MockOverlay = () => null;

// Export everything react-native-maps would export
export default WebMapView;
export const Marker = MockMarker;
export const Polyline = MockPolyline;
export const Callout = MockCallout;
export const Circle = MockCircle;
export const Polygon = MockPolygon;
export const Overlay = MockOverlay;
export const PROVIDER_GOOGLE = null;
export const PROVIDER_DEFAULT = null; 