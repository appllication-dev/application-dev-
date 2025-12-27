/**
 * Tabs Layout - Kataraa
 * Premium floating tab bar with glassmorphism
 */

import { Tabs } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="products" />
    </Tabs>
  );
}
