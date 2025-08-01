// Web-specific entry point
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Mock react-native-maps for web
if (Platform.OS === 'web') {
  // Mock the module before it's imported anywhere
  const mockModule = {
    default: () => null,
    Marker: () => null,
    Polyline: () => null,
    Callout: () => null,
    Circle: () => null,
    Polygon: () => null,
    Overlay: () => null,
    PROVIDER_GOOGLE: null,
    PROVIDER_DEFAULT: null,
  };
  
  // Mock require for react-native-maps
  const originalRequire = require;
  require = function(id) {
    if (id === 'react-native-maps') {
      return mockModule;
    }
    return originalRequire.apply(this, arguments);
  };
}

// Import the main app
import App from './app/_layout';

registerRootComponent(App); 