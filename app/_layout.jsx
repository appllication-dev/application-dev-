/**
 * Root Layout - Kataraa
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { CartAnimationProvider } from './context/CartAnimationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after layout is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <CartAnimationProvider>
                <FavoritesProvider>
                  <CheckoutProvider>
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="product/[id]" />
                      <Stack.Screen name="checkout/shipping" />
                      <Stack.Screen name="checkout/payment" />
                      <Stack.Screen name="checkout/success" />
                      <Stack.Screen name="auth" />
                      <Stack.Screen name="orders" />
                      <Stack.Screen name="voice-search" options={{ presentation: 'modal' }} />
                    </Stack>
                  </CheckoutProvider>
                </FavoritesProvider>
              </CartAnimationProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
