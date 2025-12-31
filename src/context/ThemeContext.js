/**
 * Theme Context - Cosmic Luxury Design System
 * Dark/Light Mode with Pearl & Violet Themes
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Light Theme - Pearl Cosmos
export const LIGHT_THEME = {
    // Primary Colors - Soft Orchid Violet
    primary: '#D4B8E0',
    primaryDark: '#A78BBD',
    primaryLight: '#F0E6F5',

    // Backgrounds - Pearl White
    background: '#F3F0F7',
    backgroundCard: '#ffffff',
    backgroundSecondary: '#F8F4FC',
    backgroundGlass: 'rgba(255, 255, 255, 0.75)',

    // Text - Cosmic Purple
    text: '#2D2639',
    textSecondary: '#6B5A7A',
    textMuted: '#9B8FA6',

    // Accent Colors
    accent: '#C9B8DC',
    accentGold: '#E8DCC8',
    moonSilver: '#E8E4EC',

    // Other
    border: '#EDE6F2',
    shadow: 'rgba(167, 139, 189, 0.12)',
    overlay: 'rgba(45, 38, 57, 0.4)',
    glow: 'rgba(212, 184, 224, 0.4)',

    // Status
    success: '#7BB4A3',
    warning: '#E8C88C',
    error: '#D4A5A5',
};

// Dark Theme - Cosmic Night
export const DARK_THEME = {
    // Primary Colors - Glowing Violet
    primary: '#B89FCC',
    primaryDark: '#8B6FA8',
    primaryLight: '#D4B8E0',

    // Backgrounds - Deep Cosmic
    background: '#0D0A12',
    backgroundCard: '#1A1520',
    backgroundSecondary: '#241E2D',
    backgroundGlass: 'rgba(26, 21, 32, 0.85)',

    // Text - Pearl Light
    text: '#F8F4FC',
    textSecondary: '#C9B8DC',
    textMuted: '#8A7A9A',

    // Accent Colors
    accent: '#D4C4E3',
    accentGold: '#C9BBA8',
    moonSilver: '#A8A0B0',

    // Other
    border: 'rgba(184, 159, 204, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    glow: 'rgba(184, 159, 204, 0.3)',

    // Status
    success: '#7BB4A3',
    warning: '#E8C88C',
    error: '#D4A5A5',
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
