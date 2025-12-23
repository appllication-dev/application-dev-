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
            </Stack>
          </CheckoutProvider>
        </FavoritesProvider>
      </CartAnimationProvider>
    </CartProvider>
  );
}
