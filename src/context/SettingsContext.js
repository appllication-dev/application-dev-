import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { sanitizeEmail } from '../utils/helpers';

const SettingsContext = createContext();

// Key for global language storage (independent of user)
const LANGUAGE_STORAGE_KEY = 'app_language_global';

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [sounds, setSounds] = useState(true);
    const [vibration, setVibration] = useState(true);
    const [language, setLanguage] = useState('ar');
    const [isFirstLaunch, setIsFirstLaunch] = useState(null); // null = loading, true = show onboarding, false = skip

    // Load global language setting on app start (independent of user)
    useEffect(() => {
        (async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage) {
                    setLanguage(savedLanguage);
                }
            } catch (error) {
                console.warn('Failed to load language setting', error);
            }
        })();
    }, []);

    // Check if first launch (Global, not user specific)
    useEffect(() => {
        (async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('app_has_launched');
                if (hasLaunched === null) {
                    setIsFirstLaunch(true);
                } else {
                    setIsFirstLaunch(false);
                }
            } catch (error) {
                setIsFirstLaunch(false); // Fallback
            }
        })();
    }, []);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('app_has_launched', 'true');
            setIsFirstLaunch(false);
        } catch (error) {
            console.warn('Failed to save onboarding status', error);
        }
    };

    // Reset onboarding for testing purposes
    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('app_has_launched');
            setIsFirstLaunch(true);
        } catch (error) {
            console.warn('Failed to reset onboarding status', error);
        }
    };

    // Load user-specific settings on mount or user change (except language)
    useEffect(() => {
        (async () => {
            if (!user) {
                // Reset to defaults if no user (except language - keep global)
                setNotifications(true);
                setSounds(true);
                setVibration(true);
                return;
            }

            try {
                const key = `app_settings_${sanitizeEmail(user.email)}`;
                const stored = await AsyncStorage.getItem(key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setNotifications(parsed.notifications ?? true);
                    setSounds(parsed.sounds ?? true);
                    setVibration(parsed.vibration ?? true);
                } else {
                    // New user defaults
                    setNotifications(true);
                    setSounds(true);
                    setVibration(true);
                }
            } catch (e) {
                console.warn('Failed to load settings', e);
            }
        })();
    }, [user]);

    // Persist user settings when they change (except language)
    useEffect(() => {
        if (!user) return;

        const data = { notifications, sounds, vibration };
        const key = `app_settings_${sanitizeEmail(user.email)}`;
        AsyncStorage.setItem(key, JSON.stringify(data)).catch(e => console.warn('Failed to save settings', e));
    }, [notifications, sounds, vibration, user]);

    const toggleNotifications = () => setNotifications(prev => !prev);
    const toggleSounds = () => setSounds(prev => !prev);
    const toggleVibration = () => setVibration(prev => !prev);

    // Change language and save globally (independent of user)
    const changeLanguage = async (lang) => {
        setLanguage(lang);
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch (error) {
            console.warn('Failed to save language', error);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                notifications,
                sounds,
                vibration,
                language,
                toggleNotifications,
                toggleSounds,
                toggleVibration,
                changeLanguage,
                isFirstLaunch,
                completeOnboarding,
                resetOnboarding,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

