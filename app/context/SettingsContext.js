
import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { storage } from '../utils/storage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState(I18nManager.isRTL ? 'ar' : 'en');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedNotifs = await storage.getItem('notifications');
        const savedLang = await storage.getItem('language');

        if (savedNotifs !== null) setNotifications(savedNotifs);
        if (savedLang !== null) setLanguage(savedLang);
    };

    const toggleNotifications = async () => {
        const newVal = !notifications;
        setNotifications(newVal);
        await storage.setItem('notifications', newVal);
    };

    const changeLanguage = async (lang) => {
        setLanguage(lang);
        await storage.setItem('language', lang);

        // Handle RTL Layout changes if necessary
        const isRTL = lang === 'ar';
        if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            try {
                await Updates.reloadAsync();
            } catch (error) {
                console.log('Reload not supported or failed:', error);
            }
        }
    };

    return (
        <SettingsContext.Provider value={{
            notifications,
            toggleNotifications,
            language,
            changeLanguage
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
