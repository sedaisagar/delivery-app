import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import CustomSplashScreen from "../components/SplashScreen";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { SyncService } from "../services/sync";
import { setAlertsEnabled } from "../utils/alerts";
import "./global.css";

// Disable alerts/toasts by default
setAlertsEnabled(false);

function RootLayoutContent() {
  const [fontsLoaded, error] = useFonts({
    "Quicksand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
    "Quicksand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
    "Quicksand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
    "Quicksand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
    "Quicksand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded && !authLoading) {
      // Initialize sync service
      SyncService.initialize();
      
      // Show custom splash for 2 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [fontsLoaded, error, authLoading]);

  // Debug authentication state
  useEffect(() => {
    console.log("Auth state changed:", { isAuthenticated, authLoading });
  }, [isAuthenticated, authLoading]);

  if (!fontsLoaded || isLoading || authLoading) {
    return <CustomSplashScreen visible={true} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              gestureEnabled: false // Prevent back gesture to login
            }} 
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              headerShown: false 
            }} 
          />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new-delivery" options={{ headerShown: false }} />
          <Stack.Screen name="delivery-details/[id]" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
   