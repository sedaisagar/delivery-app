# API Integration Documentation

## Overview

This document describes the API integration for the delivery app, including authentication, delivery requests, and offline sync functionality.

## API Configuration

The API configuration is defined in `constants/index.ts`:

```typescript
export const API_CONFIG = {
    BASE_URL: "https://your-api-domain.com/api/v1", // Replace with your actual API URL
    ENDPOINTS: {
        LOGIN: "/auth/login/",
        REGISTER: "/auth/register/",
        REFRESH: "/auth/refresh/",
        PROFILE: "/auth/profile/",
        DELIVERY_REQUESTS: "/delivery-requests/",
        PARTNERS: "/partners/",
        DIRECTIONS: "/directions/",
        SYNC_PENDING: "/sync/pending/",
        SYNC_STATUS: "/sync/status/",
        STATISTICS: "/statistics/",
    },
    STORAGE_KEYS: {
        ACCESS_TOKEN: "access_token",
        REFRESH_TOKEN: "refresh_token",
        USER_DATA: "user_data",
    },
};
```

## Authentication Flow

### 1. Login Screen (`app/login.tsx`)
- Email and password input
- Form validation
- Error handling
- Navigation to main app on success

### 2. Register Screen (`app/register.tsx`)
- Complete registration form
- Role selection (Customer/Driver)
- Password confirmation
- Form validation

### 3. Authentication Context (`contexts/AuthContext.tsx`)
- Manages authentication state
- Handles login/logout
- Stores user data
- Automatic token refresh

## API Services

### 1. API Service (`services/api.ts`)
- Base API client with authentication
- Token management
- Automatic token refresh
- Error handling

### 2. Delivery Service (`services/delivery.ts`)
- CRUD operations for delivery requests
- Partner management
- Directions calculation
- Statistics retrieval

### 3. Sync Service (`services/sync.ts`)
- Offline-first architecture
- Automatic sync when online
- Conflict resolution
- Local storage management

## Key Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- User profile management

### Offline Support
- Local storage for offline functionality
- Automatic sync when connection restored
- Conflict resolution
- Pending sync queue

### Delivery Management
- Create delivery requests
- Update request status
- View delivery history
- Real-time sync with server

### User Roles
- Customer: Can create delivery requests
- Driver: Can accept and manage deliveries
- Admin: Full system access

## API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `POST /auth/refresh/` - Token refresh
- `GET /auth/profile/` - Get user profile
- `PUT /auth/profile/` - Update user profile

### Delivery Requests
- `GET /delivery-requests/` - List delivery requests
- `POST /delivery-requests/` - Create delivery request
- `GET /delivery-requests/{id}/` - Get specific request
- `PUT /delivery-requests/{id}/` - Update request
- `DELETE /delivery-requests/{id}/` - Delete request

### Partners
- `GET /partners/` - Get available delivery partners

### Directions
- `GET /directions/` - Calculate route directions

### Sync
- `POST /sync/pending/` - Sync offline requests
- `GET /sync/status/` - Get sync status

### Statistics
- `GET /statistics/` - Get delivery statistics

## Data Models

### User Profile
```typescript
interface UserProfile {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: "driver" | "admin" | "customer";
    avatar?: string;
}
```

### Delivery Request
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
    serverId?: number;
    coordinates?: {
        pickup: { latitude: number; longitude: number; };
        dropoff: { latitude: number; longitude: number; };
    };
    pickupCoordinates?: { latitude: number; longitude: number; };
    dropoffCoordinates?: { latitude: number; longitude: number; };
}
```

## Setup Instructions

1. **Update API URL**: Replace the `BASE_URL` in `constants/index.ts` with your actual API endpoint.

2. **Install Dependencies**: Ensure all required packages are installed:
   ```bash
   npm install @react-native-async-storage/async-storage
   ```

3. **Configure Authentication**: The app will automatically handle authentication flow.

4. **Test API Connection**: Verify the API endpoints are accessible and responding correctly.

## Error Handling

The app includes comprehensive error handling:
- Network connectivity issues
- Authentication failures
- API errors
- Offline mode handling
- Sync conflicts

## Security Features

- JWT token authentication
- Secure token storage
- Automatic token refresh
- Input validation
- Error sanitization

## Offline Functionality

- Local storage for delivery requests
- Automatic sync when online
- Conflict resolution
- Pending sync queue
- Network status monitoring

## Testing

To test the API integration:

1. Start the app
2. Register a new account or login
3. Create a delivery request
4. Test offline functionality
5. Verify sync when connection restored

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check API URL and credentials
2. **Sync Issues**: Verify network connectivity
3. **Token Expiry**: Check refresh token implementation
4. **Offline Mode**: Ensure local storage is working

### Debug Information

Enable debug logging by checking console output for:
- API request/response logs
- Sync status updates
- Authentication state changes
- Error messages

## Future Enhancements

- Push notifications
- Real-time updates
- Advanced offline features
- Multi-language support
- Enhanced error reporting 