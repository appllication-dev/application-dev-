import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { CheckoutProvider } from "../src/context/CheckoutContext";
import { CartProvider } from "../src/context/CardContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "../src/utils/notifications";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CinematicWrapper from "./components/CinematicWrapper";
import AIChatButton from "./components/AIChatButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Note: StripePaymentProvider is only used on native platforms
// Uncomment when building for iOS/Android:
// import { StripePaymentProvider } from "../src/context/StripeContext";

// Create a client
const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
         cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
         retry: 2,
      },
   },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
   useEffect(() => {
      // Wrap in try-catch to handle Expo Go limitations gracefully
      (async () => {
         try {
            await registerForPushNotificationsAsync();
         } catch (error) {
            console.log('Notifications setup skipped (Expo Go limitation)');
         }
      })();
   }, []);

   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
               <AuthProvider>
                  <SettingsProvider>
                     <ThemeProvider>
                        {/* CinematicWrapper handles the status bar background, but we still need StatusBar component for text color */}
                        <CinematicWrapper>
                           <FavoritesProvider>
                              <CartProvider>
                                 <CheckoutProvider>
                                    <Slot />
                                    <AIChatButton />
                                 </CheckoutProvider>
                              </CartProvider>
                           </FavoritesProvider>
                        </CinematicWrapper>
                     </ThemeProvider>
                  </SettingsProvider>
               </AuthProvider>
            </QueryClientProvider>
         </ErrorBoundary>
      </GestureHandlerRootView>
   )
}