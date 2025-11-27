import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/theme';
import { useAuth } from './AuthContext';
import { sanitizeEmail } from '../utils/helpers';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on mount or user change
    useEffect(() => {
        loadTheme();
    }, [user]);

    // Save theme when it changes
    useEffect(() => {
        if (!isLoading && user) {
            saveTheme();
        }
    }, [theme, isLoading, user]);

    const loadTheme = async () => {
        if (!user) {
            setTheme('system');
            setIsLoading(false);
            return;
        }

        try {
            const key = `@theme_preference_${sanitizeEmail(user.email)}`;
            const savedTheme = await AsyncStorage.getItem(key);
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                setTheme('system');
            }
        } catch (error) {
            console.warn('Failed to load theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTheme = async () => {
        if (!user) return;
        try {
            const key = `@theme_preference_${sanitizeEmail(user.email)}`;
            await AsyncStorage.setItem(key, theme);
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
    };

    const currentTheme = theme === 'system' ? systemScheme : theme;
    const colors = Colors[currentTheme] || Colors.light;

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setScheme = (scheme) => {
        setTheme(scheme);
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, colors, toggleTheme, setScheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
