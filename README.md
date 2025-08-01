# Delivery App

A comprehensive mobile delivery request management system built with React Native, Expo, and NativeWind with role-based access control and offline-first architecture.

## Features

### ✅ Core Functionality
- **Role-Based Access Control (RBAC)**: Customer, Driver, and Admin roles with distinct permissions
- **Google Maps Integration**: Pickup and dropoff location selection with current location detection
- **Delivery Request Management**: Create, view, and update delivery requests
- **Offline-First Architecture**: Store requests locally with automatic sync when online
- **Pagination**: Infinite scrolling with loading animations for large datasets
- **Pull-to-Refresh**: Sync pending data and fetch fresh data from server
- **Real-time Status Updates**: Track delivery status (pending, assigned, in_progress, completed, cancelled)

### 🏗️ Architecture
- **React Native + Expo**: Cross-platform mobile development
- **NativeWind**: Tailwind CSS for React Native
- **Expo Router**: File-based routing system
- **TypeScript**: Type-safe development
- **AsyncStorage**: Local data persistence
- **NetInfo**: Network connectivity monitoring
- **React Native Maps**: Native map integration

## Role-Based Access Control

### 👤 Customer Role
- Create new delivery requests
- Assign drivers to requests
- View all their delivery requests
- Update request details (before assignment)

### 🚗 Driver Role
- View only assigned delivery requests
- Update delivery status (pending → assigned → in_progress → completed)
- Cannot create new requests
- Cannot assign other drivers

### 👨‍💼 Admin Role
- Blocked from mobile app access
- Must use web dashboard for management

## Project Structure

```
delivery-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Home screen with stats
│   │   ├── delivery-requests.tsx # Request list with pagination
│   │   └── profile.tsx          # User profile and logout
│   ├── new-delivery.tsx         # Create new delivery request
│   ├── delivery-details/
│   │   └── [id].tsx            # Individual request details
│   ├── login.tsx               # User authentication
│   ├── register.tsx            # User registration
│   ├── _layout.tsx              # Root layout with font loading
│   └── global.css               # Global styles
├── services/
│   ├── api.ts                  # API service with auth handling
│   ├── delivery.ts             # Delivery-specific API calls
│   ├── storage.ts              # Local storage management
│   └── sync.ts                 # Offline sync logic
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── components/
│   ├── MapWrapper.tsx          # Cross-platform map component
│   ├── MapPicker.tsx           # Location picker modal
│   ├── RefreshControl.tsx      # Custom refresh control
│   └── LoadingDots.tsx         # Loading animation
├── types/
│   └── delivery.ts             # TypeScript type definitions
├── utils/
│   └── alerts.ts               # Alert management utilities
├── assets/
│   ├── fonts/                  # Custom fonts
│   ├── icons/                  # App icons
│   └── images/                 # App images
└── package.json
```

## Key Components

### 1. **Authentication** (`app/login.tsx`, `app/register.tsx`)
- User login and registration
- Role-based access validation
- Admin blocking functionality
- Generic error messages
- JWT token management

### 2. **Home Screen** (`app/(tabs)/index.tsx`)
- Role-based welcome messages
- Delivery statistics with period filtering
- Quick actions based on user role
- Eager loading of stats

### 3. **New Delivery Form** (`app/new-delivery.tsx`)
- **Auto-fill Customer Info**: Name automatically filled from user profile
- **Location Services**: Current location detection for pickup/dropoff
- **Form Validation**: Required field validation
- **Role Restrictions**: Drivers cannot access this screen
- **Offline Support**: Works without internet connection

### 4. **Request History** (`app/(tabs)/delivery-requests.tsx`)
- **Pagination**: Infinite scrolling with loading animations
- **Role-Based Content**: Drivers see assigned requests, customers see all
- **Pull-to-Refresh**: Syncs pending data and fetches fresh data
- **Status Indicators**: Visual status badges with colors
- **Dynamic UI**: Title and actions change based on user role

### 5. **Request Details** (`app/delivery-details/[id].tsx`)
- Complete request information
- **Role-Based Actions**: Drivers can update status, customers can assign drivers
- **Status Management**: Visual status indicators
- **Driver Assignment**: Customer-only functionality
- **Single Item Fetch**: Optimized API calls

### 6. **Profile Screen** (`app/(tabs)/profile.tsx`)
- User information and statistics
- **Data Loss Warning**: Warns about pending sync on logout
- **Period Filtering**: Statistics with time period selection
- **Logout Flow**: Clears all local data

## Services

### **API Service** (`services/api.ts`)
- Centralized HTTP client
- JWT token management
- Automatic token refresh
- Generic error handling
- Force logout on auth failures

### **Delivery Service** (`services/delivery.ts`)
- Role-based API endpoints
- Pagination support
- Statistics API integration
- Data transformation (snake_case to camelCase)
- Single item fetching

### **Sync Service** (`services/sync.ts`)
- Offline-first data synchronization
- Pending request management
- Conflict resolution
- Role-based data fetching
- Force sync functionality

### **Storage Service** (`services/storage.ts`)
- Local data persistence using AsyncStorage
- CRUD operations for delivery requests
- Pending sync queue management
- User data storage

## Data Models

### **DeliveryRequest**
```typescript
interface DeliveryRequest {
  id: string;
  serverId?: number;
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryNote?: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  syncStatus: "synced" | "pending" | "failed" | "offline";
  createdAt: string;
  updatedAt?: string;
  coordinates?: {
    pickup: { latitude: number; longitude: number; };
    dropoff: { latitude: number; longitude: number; };
  };
  // Driver-specific fields
  assignedAt?: string;
  assignedByEmail?: string;
  driverEmail?: string;
  driverName?: string;
  customerEmail?: string;
}
```

### **UserProfile**
```typescript
interface UserProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "customer" | "driver" | "admin";
  phone?: string;
}
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Additional Dependencies**
   ```bash
   npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo expo-location react-native-maps
   ```

3. **Configure Google Maps** (Optional)
   - Add Google Maps API key to `app.json`
   - Configure directions API for route planning

4. **Start Development Server**
   ```bash
   npm start
   ```

## Usage

### Authentication
1. Register with email, username, and password
2. Login with credentials
3. Role-based access is automatically applied

### Creating a Delivery Request (Customers Only)
1. Navigate to Home screen
2. Tap "New Delivery Request"
3. Customer name is auto-filled and non-editable
4. Fill in pickup and dropoff addresses (or use current location)
5. Enter customer phone and optional notes
6. Submit request

### Managing Deliveries
- **Customers**: Can assign drivers and view all requests
- **Drivers**: Can only view assigned requests and update status
- **Pull-to-Refresh**: Syncs pending data and fetches fresh data
- **Pagination**: Scroll to load more requests

### Offline Functionality
- App works completely offline
- Requests are stored locally
- Automatic sync when connection is restored
- Visual indicators show sync status

## Technical Features

### **Offline-First Architecture**
- All data stored locally first
- Queue system for offline changes
- Automatic sync when online
- Conflict resolution

### **Role-Based Security**
- Customer: Create, assign, view all
- Driver: View assigned, update status
- Admin: Blocked from mobile app

### **Pagination & Performance**
- Infinite scrolling with loading animations
- Optimized API calls
- Efficient data transformation
- Memory-conscious list rendering

### **Error Handling**
- Generic user-friendly error messages
- Network connectivity checks
- Automatic retry mechanisms
- Graceful degradation

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

## API Integration

### **Authentication Flow**
- JWT token management
- Automatic token refresh
- Force logout on auth failures
- Role-based endpoint access

### **Data Synchronization**
- Offline queue management
- Conflict resolution
- Role-based data filtering
- Optimistic updates

### **Pagination**
- Server-side pagination
- Infinite scrolling
- Loading states
- Efficient data fetching

## Customization

### **Styling**
- Uses NativeWind (Tailwind CSS for React Native)
- Custom color scheme defined in `tailwind.config.js`
- Custom fonts (Quicksand family)
- Role-based UI theming

### **Configuration**
- Font loading in `app/_layout.tsx`
- Sync service initialization
- Storage keys and settings
- API endpoint configuration

## Future Enhancements

- [ ] Push notifications for status updates
- [ ] Real-time location tracking
- [ ] Advanced filtering and search
- [ ] Route optimization
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode support

## Dependencies

### **Core**
- `expo`: ~53.0.20
- `react-native`: 0.79.5
- `expo-router`: ~5.1.4
- `nativewind`: ^4.1.23

### **Storage & Sync**
- `@react-native-async-storage/async-storage`: 1.23.1
- `@react-native-community/netinfo`: 11.3.1

### **Location & Maps**
- `expo-location`: ~18.0.0
- `react-native-maps`: ^1.10.0

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

---

# Android Release Steps
0. `npx expo prebuild -p android`
1. `openssl rand -hex 32`
2. [Follow React Native signing guide](https://reactnative.dev/docs/signed-apk-android)
3. `npx react-native build-android --mode=release`
4. `npx expo run:android --variant release` 

