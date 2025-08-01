import React from 'react';

// Import react-native-maps directly
import MapView, { Marker as NativeMarker, Polyline as NativePolyline, PROVIDER_GOOGLE as NativeProviderGoogle } from 'react-native-maps';

interface MapWrapperProps {
  children: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export default function MapWrapper({ children, style, ...props }: MapWrapperProps) {
  return (
    <MapView style={style} {...props}>
      {children}
    </MapView>
  );
}

// Export marker component
export const Marker = NativeMarker;

// Export polyline component
export const Polyline = NativePolyline;

// Export provider
export const PROVIDER_GOOGLE = NativeProviderGoogle;

