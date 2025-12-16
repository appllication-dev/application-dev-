import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Cross-platform storage adapter
 * Uses SecureStore on Native (iOS/Android) for security
 * Uses AsyncStorage on Web (localStorage) as fallback
 */
export const storage = {
    setItem: async (key, value) => {
        try {
            if (isWeb) {
                await AsyncStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error('Storage setItem error:', error);
        }
    },

    getItem: async (key) => {
        try {
            if (isWeb) {
                return await AsyncStorage.getItem(key);
            } else {
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    },

    removeItem: async (key) => {
        try {
            if (isWeb) {
                await AsyncStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error('Storage removeItem error:', error);
        }
    }
};
