# Google Maps Setup Guide

## 🗺️ Google Maps Integration

The delivery app now includes full Google Maps integration for location selection and route visualization.

## Features Added

### ✅ **Map Picker Component**
- **Full-screen map modal** for location selection
- **Search functionality** to find addresses
- **Current location detection** with permission handling
- **Tap to select** locations on the map
- **Address reverse geocoding** for selected coordinates

### ✅ **Enhanced Delivery Form**
- **"Select on Map" buttons** for pickup and dropoff locations
- **Current location buttons** for quick location detection
- **Coordinate storage** with delivery requests
- **Visual feedback** for selected locations

### ✅ **Route Visualization**
- **Map view in delivery details** showing pickup and dropoff points
- **Color-coded markers** (orange for pickup, green for dropoff)
- **Interactive map** with zoom and pan capabilities

## Setup Instructions

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Google Maps API Key Setup**

#### For Android:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps SDK for Android
4. Create credentials (API Key)
5. Add the API key to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

#### For iOS:
1. Enable Maps SDK for iOS in Google Cloud Console
2. Create iOS API key
3. Add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    }
  }
}
```

### 3. **Location Permissions**

The app automatically requests location permissions when needed. Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location for delivery requests."
        }
      ]
    ]
  }
}
```

## Usage

### **Creating Delivery Requests**
1. Tap "New Delivery Request" from home screen
2. For pickup location:
   - Tap "Current Location" for automatic detection
   - Tap "Select on Map" to choose from map
   - Or type address manually
3. For dropoff location:
   - Same options as pickup
4. Fill in customer details
5. Submit request

### **Map Picker Features**
- **Search**: Type address and tap search icon
- **Current Location**: Automatically detects your position
- **Tap to Select**: Tap anywhere on map to select location
- **Confirm**: Tap "Confirm" to save selected location

### **Viewing Routes**
- Open any delivery request from the Requests tab
- View the route map showing pickup and dropoff points
- Orange marker = Pickup location
- Green marker = Dropoff location

## Technical Details

### **Components**
- `MapPicker.tsx`: Full-screen map selection component
- `new-delivery.tsx`: Enhanced with map integration
- `delivery-details/[id].tsx`: Route visualization

### **Dependencies**
- `react-native-maps`: Google Maps integration
- `expo-location`: Location services and geocoding

### **Features**
- **Offline Support**: Maps work with cached data when offline
- **Permission Handling**: Automatic location permission requests
- **Error Handling**: Graceful fallbacks for location services
- **Coordinate Storage**: Saves precise coordinates with requests

## Troubleshooting

### **Maps Not Loading**
1. Check API key configuration
2. Verify internet connection
3. Ensure location permissions are granted

### **Location Not Working**
1. Check device location settings
2. Grant location permissions when prompted
3. Try restarting the app

### **Search Not Working**
1. Check internet connection
2. Try different search terms
3. Verify Google Maps API is enabled

## Next Steps

- [ ] Add route directions between pickup and dropoff
- [ ] Implement real-time location tracking
- [ ] Add distance and time calculations
- [ ] Integrate with navigation apps
- [ ] Add multiple waypoint support

## API Keys Security

⚠️ **Important**: Never commit API keys to version control. Use environment variables or secure key management.

For production:
1. Use environment variables
2. Restrict API keys to your app's bundle ID
3. Set up proper API key restrictions in Google Cloud Console 