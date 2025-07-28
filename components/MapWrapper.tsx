import React from 'react';
import MapFallback from './MapFallback';

// Conditional import to prevent duplicate registration
let MapView: any;
let Marker: any;
let Polyline: any;
let PROVIDER_GOOGLE: any;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('react-native-maps not available:', error);
}

interface MapWrapperProps {
  children: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export default function MapWrapper({ children, style, ...props }: MapWrapperProps) {
  if (!MapView) {
    return <MapFallback message="Maps not available on this platform" />;
  }

  return (
    <MapView style={style} {...props}>
      {children}
    </MapView>
  );
}

export { Marker, PROVIDER_GOOGLE, Polyline };

