/**
 * Theme Context - Dark/Light Mode Support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const LIGHT_THEME = {
    // Primary Colors - Blush Pink & Rose Gold
    primary: '#F5B5C8',
    primaryDark: '#B76E79',
    primaryLight: '#FFD6E0',

    // Backgrounds - Champagne/Cream
    background: '#FFF9F5',
    backgroundCard: '#ffffff',
    backgroundSecondary: '#FDF2F0',

    // Text - Deep Charcoal
    text: '#3D2314',
    textSecondary: '#7A5C5C',
    textMuted: '#A68E8E',

    // Other
    border: '#FFE4E9',
    shadow: 'rgba(183, 110, 121, 0.15)',
    overlay: 'rgba(61, 35, 20, 0.4)',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#B76E79',
};

export const DARK_THEME = {
    // Primary Colors - Warm Rose Gold
    primary: '#B76E79',
    primaryDark: '#9A5B64',
    primaryLight: '#F5B5C8',

    // Backgrounds - Deep Espresso
    background: '#1A120F',
    backgroundCard: '#2A1D18',
    backgroundSecondary: '#3D2314',

    // Text - Shell/Cream
    text: '#FFF9F5',
    textSecondary: '#F5B5C8',
    textMuted: '#A68E8E',

    // Other
    border: 'rgba(183, 110, 121, 0.2)',
    shadow: 'rgba(183, 110, 121, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#F5B5C8',
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [theme, setTheme] = useState(LIGHT_THEME);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme === 'dark') {
                setIsDark(true);
                setTheme(DARK_THEME);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newIsDark = !isDark;
            setIsDark(newIsDark);
            setTheme(newIsDark ? DARK_THEME : LIGHT_THEME);
            await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Default export to satisfy Expo Router requirements if it processes this file
export default function ThemeContextRoute() {
    return null;
}
