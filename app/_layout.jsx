import { Slot } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { CheckoutProvider } from "../src/context/CheckoutContext";
import { SettingsProvider } from "../src/context/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "../src/utils/notifications";
import { Platform } from "react-native";

// Note: StripePaymentProvider is only used on native platforms
// Uncomment when building for iOS/Android:
// import { StripePaymentProvider } from "../src/context/StripeContext";

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
      <ErrorBoundary>
         <AuthProvider>
            <SettingsProvider>
               <ThemeProvider>
                  <FavoritesProvider>
                     <CheckoutProvider>
                        <Slot />
                     </CheckoutProvider>
                  </FavoritesProvider>
               </ThemeProvider>
            </SettingsProvider>
         </AuthProvider>
      </ErrorBoundary>
   )
}