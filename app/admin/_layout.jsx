/**
 * Admin Layout - Kataraa
 * Layout for admin screens
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background },
            }}
        >
            <Stack.Screen name="analytics-dashboard" />
        </Stack>
    );
}
