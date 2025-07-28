import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapPicker from "../components/MapPicker";
import { SyncService } from "../services/sync";
import { DeliveryFormData } from "../types/delivery";

export default function NewDeliveryScreen() {
  const [formData, setFormData] = useState<DeliveryFormData>({
    pickupAddress: "",
    dropoffAddress: "",
    customerName: "",
    customerPhone: "",
    deliveryNote: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropoffMap, setShowDropoffMap] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const handleInputChange = (field: keyof DeliveryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = async (type: "pickup" | "dropoff") => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const fullAddress = `${address[0].street}, ${address[0].city}, ${address[0].region}`;
        if (type === "pickup") {
          handleInputChange("pickupAddress", fullAddress);
          setPickupLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: fullAddress,
          });
        } else {
          handleInputChange("dropoffAddress", fullAddress);
          setDropoffLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: fullAddress,
          });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    }
  };

  const handlePickupLocationSelect = (location: { address: string; latitude: number; longitude: number }) => {
    handleInputChange("pickupAddress", location.address);
    setPickupLocation(location);
  };

  const handleDropoffLocationSelect = (location: { address: string; latitude: number; longitude: number }) => {
    handleInputChange("dropoffAddress", location.address);
    setDropoffLocation(location);
  };

  const validateForm = () => {
    if (!formData.pickupAddress.trim()) {
      Alert.alert("Error", "Please enter pickup address");
      return false;
    }
    if (!formData.dropoffAddress.trim()) {
      Alert.alert("Error", "Please enter dropoff address");
      return false;
    }
    if (!formData.customerName.trim()) {
      Alert.alert("Error", "Please enter customer name");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert("Error", "Please enter customer phone");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newRequest = await SyncService.createDeliveryRequest({
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryNote: formData.deliveryNote,
        status: "pending",
        coordinates: pickupLocation && dropoffLocation ? {
          pickup: {
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          },
          dropoff: {
            latitude: dropoffLocation.latitude,
            longitude: dropoffLocation.longitude,
          },
        } : undefined,
      });

      const isOnline = SyncService.isDeviceOnline();
      Alert.alert(
        "Success",
        `Delivery request created successfully!${!isOnline ? " (Will sync when online)" : ""}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create delivery request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View className="mt-5 bg-white px-6 pt-6 pb-6 shadow-header">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#181C2E" />
            </TouchableOpacity>
            <Text className="font-quicksand-bold text-xl text-dark-100">
              New Delivery Request
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Form */}
        <ScrollView 
          className="flex-1 px-6 py-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
          automaticallyAdjustKeyboardInsets={true}
        >
          <View className="space-y-8">
            {/* Customer Information */}
            <View className="bg-white p-6 rounded-xl shadow-card">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-blue-100 p-3 rounded-full">
                  <Ionicons name="person" size={24} color="#3B82F6" />
                </View>
                <Text className="font-quicksand-bold text-dark-100 text-xl ml-5">
                  Customer Information
                </Text>
              </View>

              <View className="space-y-6">
                <View>
                  <Text className="font-quicksand-bold text-dark-100 text-lg mb-3">
                    Customer Name
                  </Text>
                  <TextInput
                    value={formData.customerName}
                    onChangeText={(text) => handleInputChange("customerName", text)}
                    placeholder="Enter customer name"
                    className="bg-gray-50 p-4 rounded-xl font-quicksand text-base"
                    returnKeyType="next"
                  />
                </View>

                <View>
                  <Text className="font-quicksand-bold text-dark-100 text-lg mb-3">
                    Phone Number
                  </Text>
                  <TextInput
                    value={formData.customerPhone}
                    onChangeText={(text) => handleInputChange("customerPhone", text)}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    className="bg-gray-50 p-4 rounded-xl font-quicksand text-base"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            {/* Pickup Address */}
            <View className="bg-white p-6 rounded-xl mt-5 shadow-card">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-orange-100 p-3 rounded-full">
                  <Ionicons name="location" size={24} color="#FE8C00" />
                </View>
                <Text className="font-quicksand-bold text-dark-100 text-xl ml-5">
                  Pickup Address
                </Text>
              </View>

              <View className="space-y-4">
                <TextInput
                  value={formData.pickupAddress}
                  onChangeText={(text) => handleInputChange("pickupAddress", text)}
                  placeholder="Enter pickup address"
                  className="bg-gray-50 p-4 rounded-xl font-quicksand text-base"
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                />
                <View className="flex-row space-x-3 mt-2">
                  <TouchableOpacity
                    onPress={() => getCurrentLocation("pickup")}
                    className="flex-1 bg-gray p-4 rounded-xl flex-row items-center justify-center space-x-3 mr-2 border border-primary"
                  >
                    <Ionicons name="location" size={18} color="orange" />
                    <Text className="font-quicksand-bold text-gray text-base">Current Location</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowPickupMap(true)}
                    className="flex-1 bg-primary p-4 rounded-xl flex-row items-center justify-center space-x-3"
                  >
                    <Ionicons name="map" size={18} color="white" />
                    <Text className="pl-2 font-quicksand-bold text-white text-base">Select on Map</Text>
                  </TouchableOpacity>
                </View>
                {pickupLocation && (
                  <View className="bg-green-50 p-3 rounded-xl mt-2">
                    <Text className="font-quicksand text-green-800 text-sm">
                      📍 Coordinates: {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Dropoff Address */}
            <View className="bg-white p-6 rounded-xl mt-5 shadow-card">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-green-100 p-3 rounded-full">
                  <Ionicons name="location" size={24} color="#2F9B65" />
                </View>
                <Text className="font-quicksand-bold text-dark-100 text-xl ml-5">
                  Dropoff Address
                </Text>
              </View>

              <View className="space-y-4">
                <TextInput
                  value={formData.dropoffAddress}
                  onChangeText={(text) => handleInputChange("dropoffAddress", text)}
                  placeholder="Enter dropoff address"
                  className="bg-gray-50 p-4 rounded-xl font-quicksand text-base"
                  multiline
                  numberOfLines={3}
                  returnKeyType="next"
                />
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => getCurrentLocation("dropoff")}
                    className="flex-1 bg-gray p-4 rounded-xl flex-row items-center justify-center space-x-3 mr-2 border border-primary"
                  >
                    <Ionicons name="location" size={18} color="orange" />
                    <Text className="font-quicksand-bold text-gray text-base">Current Location</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDropoffMap(true)}
                    className="flex-1 bg-primary p-4 rounded-xl flex-row items-center justify-center space-x-3"
                  >
                    <Ionicons name="map" size={18} color="white" />
                    <Text className="pl-2 font-quicksand-bold text-white text-base">Select on Map</Text>
                  </TouchableOpacity>
                </View>
                {dropoffLocation && (
                  <View className="bg-green-50 p-3 rounded-xl mt-2">
                    <Text className="font-quicksand text-green-800 text-sm">
                      📍 Coordinates: {dropoffLocation.latitude.toFixed(6)}, {dropoffLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Delivery Note */}
            <View className="bg-white p-6 rounded-xl mt-5 shadow-card">
              <View className="flex-row items-center space-x-3 mb-6">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="document-text" size={24} color="#8B5CF6" />
                </View>
                <Text className="font-quicksand-bold text-dark-100 text-xl ml-5">
                  Delivery Note (Optional)
                </Text>
              </View>

              <TextInput
                value={formData.deliveryNote}
                onChangeText={(text) => handleInputChange("deliveryNote", text)}
                placeholder="Add any special instructions or notes..."
                className="bg-gray-50 p-4 rounded-xl font-quicksand text-base"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="mt-8 mb-8">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`p-6 rounded-xl ${isSubmitting ? 'bg-gray-300' : 'bg-primary'} shadow-primary`}
            >
              <View className="flex-row items-center justify-center space-x-3">
                {isSubmitting ? (
                  <Ionicons name="hourglass" size={24} color="white" />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
                <Text className="font-quicksand-bold text-white text-xl">
                  {isSubmitting ? "Creating Request..." : "Create Delivery Request"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="mt-8 mb-8"/>
        </ScrollView>

        {/* Map Pickers */}
        <MapPicker
          visible={showPickupMap}
          onClose={() => setShowPickupMap(false)}
          onLocationSelect={handlePickupLocationSelect}
          initialLocation={pickupLocation || undefined}
        />

        <MapPicker
          visible={showDropoffMap}
          onClose={() => setShowDropoffMap(false)}
          onLocationSelect={handleDropoffLocationSelect}
          initialLocation={dropoffLocation || undefined}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 