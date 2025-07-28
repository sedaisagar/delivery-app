import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapWrapper, { Marker, PROVIDER_GOOGLE } from './MapWrapper';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapPicker({ visible, onClose, onLocationSelect, initialLocation }: MapPickerProps) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05, // Normal street level zoom
    longitudeDelta: 0.05, // Normal street level zoom
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  useEffect(() => {
    if (initialLocation) {
      setRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.05, // Normal street level zoom
        longitudeDelta: 0.05, // Normal street level zoom
      });
      setSelectedLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        address: "Selected location",
      });
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05, // Normal street level zoom
        longitudeDelta: 0.05, // Normal street level zoom
      };
      setRegion(newRegion);
      
      // Get address for current location
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const fullAddress = `${address[0].street}, ${address[0].city}, ${address[0].region}`;
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: fullAddress,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleMapPress = async (event: any) => {
    console.log('Map pressed:', event.nativeEvent);
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const fullAddress = `${address[0].street}, ${address[0].city}, ${address[0].region}`;
        setSelectedLocation({
          latitude,
          longitude,
          address: fullAddress,
        });
      } else {
        // If no address found, still set the coordinates
        setSelectedLocation({
          latitude,
          longitude,
          address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
      // Still set the location even if address lookup fails
      setSelectedLocation({
        latitude,
        longitude,
        address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  };

  const handleMarkerPress = (event: any) => {
    console.log('Marker pressed:', event.nativeEvent);
    // When marker is pressed, it should be selected
    if (selectedLocation) {
      // The marker is already selected, so we can show additional info or just confirm
      Alert.alert(
        'Location Selected',
        `Address: ${selectedLocation.address}\nCoordinates: ${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: handleConfirm }
        ]
      );
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('Error', 'Please select a location on the map');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const location = results[0];
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05, // Normal street level zoom
          longitudeDelta: 0.05, // Normal street level zoom
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion?.(newRegion);
        
        // Get address for the searched location
        const address = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (address.length > 0) {
          const fullAddress = `${address[0].street}, ${address[0].city}, ${address[0].region}`;
          setSelectedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            address: fullAddress,
          });
        } else {
          setSelectedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            address: searchQuery,
          });
        }
      } else {
        Alert.alert('Not Found', 'Location not found. Please try a different search term.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for location');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-12 pb-6 shadow-header">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#181C2E" />
            </TouchableOpacity>
            <Text className="font-quicksand-bold text-xl text-dark-100">
              Select Location
            </Text>
            <TouchableOpacity onPress={handleConfirm} className="p-2">
              <Text className="font-quicksand-bold text-primary text-lg">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-4 bg-white shadow-header">
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-gray-50 rounded-xl p-4">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for a location..."
                className="font-quicksand text-base"
                onSubmitEditing={searchLocation}
              />
            </View>
            <TouchableOpacity
              onPress={searchLocation}
              className="bg-primary p-4 rounded-xl shadow-primary"
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map */}
        <View className="flex-1">
          <MapWrapper
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Selected Location"
                description={selectedLocation.address}
                pinColor="red"
                onPress={handleMarkerPress}
                draggable={true}
                onDragEnd={(event: any) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setSelectedLocation(prev => prev ? {
                    ...prev,
                    latitude,
                    longitude,
                  } : null);
                }}
              />
            )}
          </MapWrapper>
        </View>

        {/* Selected Location Info */}
        {selectedLocation && (
          <View className="bg-white p-6 shadow-header">
            <View className="bg-green-50 p-4 rounded-xl">
              <View className="flex-row items-center space-x-3 mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#2F9B65" />
                <Text className="font-quicksand-bold text-dark-100 text-lg">
                  Selected Location
                </Text>
              </View>
              <Text className="font-quicksand text-dark-100 text-base leading-6 mb-3">
                {selectedLocation.address}
              </Text>
              <View className="bg-white p-3 rounded-lg">
                <Text className="font-quicksand-bold text-green-800 text-sm mb-1">
                  📍 Coordinates:
                </Text>
                <Text className="font-quicksand text-green-700 text-sm">
                  Lat: {selectedLocation.latitude.toFixed(6)}
                </Text>
                <Text className="font-quicksand text-green-700 text-sm">
                  Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-primary p-3 rounded-lg mt-3"
              >
                <Text className="font-quicksand-bold text-white text-center">
                  Confirm This Location
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View className="bg-gray-50 p-6">
          <View className="bg-white p-4 rounded-xl shadow-card">
            <View className="flex-row items-center space-x-3 mb-2">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="font-quicksand-bold text-dark-100 text-base">
                Instructions
              </Text>
            </View>
            <Text className="font-quicksand text-gray-100 text-sm leading-5">
              • Tap on the map to select a location{'\n'}
              • Tap on the red marker to view details{'\n'}
              • Drag the marker to adjust position{'\n'}
              • Search for an address above
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
} 