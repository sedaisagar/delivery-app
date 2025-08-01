# Delivery App

A comprehensive mobile delivery request management system built with React Native, Expo, and NativeWind.

## Features

### ✅ Core Functionality
- **Google Maps Integration**: Pickup and dropoff location selection with current location detection
- **Delivery Request Form**: Complete form with all required fields (addresses, customer info, notes)
- **Offline Support**: Store requests locally when offline
- **Auto-Sync**: Automatically sync with server when back online
- **Request History**: Display past delivery requests with sync status indicators

### 🏗️ Architecture
- **React Native + Expo**: Cross-platform mobile development
- **NativeWind**: Tailwind CSS for React Native
- **Expo Router**: File-based routing system
- **TypeScript**: Type-safe development
- **AsyncStorage**: Local data persistence
- **NetInfo**: Network connectivity monitoring

## Project Structure

```
delivery-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Home screen
│   │   ├── delivery-requests.tsx # Request history screen
│   │   └── profile.tsx          # User profile screen
│   ├── new-delivery.tsx         # Create new delivery request
│   ├── delivery-details/
│   │   └── [id].tsx            # Individual request details
│   ├── _layout.tsx              # Root layout with font loading
│   └── global.css               # Global styles
├── services/
│   ├── storage.ts               # Local storage management
│   └── sync.ts                  # Online/offline sync logic
├── types/
│   └── delivery.ts              # TypeScript type definitions
├── assets/
│   └── fonts/                   # Custom fonts
└── package.json
```

## Key Components

### 1. **Home Screen** (`app/(tabs)/index.tsx`)
- Welcome message and quick stats
- Quick access to create new delivery requests
- View delivery history

### 2. **New Delivery Form** (`app/new-delivery.tsx`)
- **Location Services**: Current location detection for pickup/dropoff
- **Form Validation**: Required field validation
- **Offline Support**: Works without internet connection
- **Auto-Sync**: Syncs when back online

### 3. **Request History** (`app/(tabs)/delivery-requests.tsx`)
- List all delivery requests
- **Sync Status Indicators**: 
  - ✅ Synced (green checkmark)
  - ⏰ Pending (orange clock)
  - ❌ Failed (red X)
  - 📱 Offline (gray cloud)
- Status badges (pending, in progress, completed)

### 4. **Request Details** (`app/delivery-details/[id].tsx`)
- Complete request information
- Customer details
- Location information
- Delivery notes
- Status management

### 5. **Profile Screen** (`app/(tabs)/profile.tsx`)
- User information
- Delivery statistics
- Settings and preferences
- Logout functionality

## Services

### **Storage Service** (`services/storage.ts`)
- Local data persistence using AsyncStorage
- CRUD operations for delivery requests
- Pending sync queue management
- User data storage

### **Sync Service** (`services/sync.ts`)
- Network connectivity monitoring
- Automatic sync when online
- Offline queue management
- Conflict resolution

## Data Models

### **DeliveryRequest**
```typescript
interface DeliveryRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  syncStatus: "synced" | "pending" | "failed" | "offline";
  createdAt: string;
  updatedAt?: string;
  coordinates?: {
    pickup: { latitude: number; longitude: number; };
    dropoff: { latitude: number; longitude: number; };
  };
}
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Additional Dependencies**
   ```bash
   npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo expo-location
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## Usage

### Creating a Delivery Request
1. Navigate to Home screen
2. Tap "New Delivery Request"
3. Fill in pickup and dropoff addresses (or use current location)
4. Enter customer information
5. Add optional delivery notes
6. Submit request

### Offline Functionality
- App works completely offline
- Requests are stored locally
- Automatic sync when connection is restored
- Visual indicators show sync status

### Viewing Requests
- Tap "Requests" tab to see all delivery requests
- Tap any request to view details
- Sync status is shown with icons and colors

## Technical Features

### **Offline-First Architecture**
- All data stored locally first
- Queue system for offline changes
- Automatic sync when online
- Conflict resolution

### **Location Services**
- Current location detection
- Address reverse geocoding
- Permission handling
- Fallback to manual input

### **Network Monitoring**
- Real-time connectivity detection
- Automatic sync triggers
- Offline queue management
- Error handling and retry logic

### **Type Safety**
- Full TypeScript implementation
- Strict type checking
- Interface definitions for all data models

## Customization

### **Styling**
- Uses NativeWind (Tailwind CSS for React Native)
- Custom color scheme defined in `tailwind.config.js`
- Custom fonts (Quicksand family)

### **Configuration**
- Font loading in `app/_layout.tsx`
- Sync service initialization
- Storage keys and settings

## Future Enhancements

- [ ] Real Google Maps integration
- [ ] Push notifications
- [ ] Real-time updates
- [ ] Advanced filtering and search
- [ ] Route optimization
- [ ] Driver assignment
- [ ] Payment integration
- [ ] Analytics dashboard

## Dependencies

### **Core**
- `expo`: ~53.0.20
- `react-native`: 0.79.5
- `expo-router`: ~5.1.4
- `nativewind`: ^4.1.23

### **Storage & Sync**
- `@react-native-async-storage/async-storage`: 1.23.1
- `@react-native-community/netinfo`: 11.3.1

### **Location Services**
- `expo-location`: ~18.0.0

### **UI & Icons**
- `@expo/vector-icons`: ^14.1.0
- `expo-font`: ~13.3.2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
# delivery-app


# Android Release Steps
0. npx expo prebuild -p android
1. openssl rand -hex 32
2. [text](https://reactnative.dev/docs/signed-apk-android)
3. npx react-native build-android --mode=release
4. npx expo run:android --variant release 

