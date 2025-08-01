import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { deliveryService } from "../services/delivery";
import { Partner } from "../types/delivery";

interface PartnerSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectPartner: (partner: Partner) => void;
  selectedPartnerId?: number;
  location?: string;
}

export default function PartnerSelector({
  visible,
  onClose,
  onSelectPartner,
  selectedPartnerId,
  location,
}: PartnerSelectorProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const availablePartners = await deliveryService.getPartners(location, 10); // 10km radius
      setPartners(availablePartners);
    } catch (error) {
      console.log("Error loading partners:", error);
      Alert.alert("Error", "Failed to load available partners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSelect = (partner: Partner) => {
    onSelectPartner(partner);
    onClose();
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity
      onPress={() => handlePartnerSelect(item)}
      className={`bg-white p-4 rounded-xl mb-3 mx-4 ${
        selectedPartnerId === item.id ? "border-2 border-primary" : ""
      }`}
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
          <View className="flex-row items-center space-x-2 mb-2">
            <Text className="font-quicksand-bold text-dark-100 text-lg">
              {item.name}
            </Text>
            {item.available && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="font-quicksand-bold text-green-800 text-xs">
                  Available
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center space-x-2 mb-1">
            <Ionicons name="call" size={14} color="#878787" />
            <Text className="font-quicksand text-gray-100 text-sm">
              {item.phone}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2 mb-1">
            <Ionicons name="mail" size={14} color="#878787" />
            <Text className="font-quicksand text-gray-100 text-sm">
              {item.email}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center space-x-1">
              <Ionicons name="star" size={14} color="#FE8C00" />
              <Text className="font-quicksand text-gray-100 text-sm">
                {item.rating.toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-1">
              <Ionicons name="location" size={14} color="#878787" />
              <Text className="font-quicksand text-gray-100 text-sm">
                {item.distance}
              </Text>
            </View>
          </View>
        </View>
        
        {selectedPartnerId === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#2F9B65" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={loadPartners}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-12 pb-6" style={{
          shadowColor: "#9CA3AF",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 1,
        }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#181C2E" />
            </TouchableOpacity>
            <Text className="font-quicksand-bold text-xl text-dark-100">
              Select Driver
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="font-quicksand text-gray-100 text-lg">
              Loading available drivers...
            </Text>
          </View>
        ) : (
          <FlatList
            data={partners}
            renderItem={renderPartner}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-16 px-6">
                <View className="bg-white p-8 rounded-2xl" style={{
                  shadowColor: "#6B7280",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}>
                  <View className="bg-gray-100 p-6 rounded-full self-center mb-6">
                    <Ionicons name="car" size={48} color="#878787" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-100 text-xl text-center mb-3">
                    No drivers available
                  </Text>
                  <Text className="font-quicksand text-gray-100 text-center text-base leading-6">
                    No delivery partners are currently available in your area
                  </Text>
                </View>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
} 