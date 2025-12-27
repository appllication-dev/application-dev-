
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const savedUser = await storage.getItem('user');
            if (savedUser) {
                setUser(savedUser);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const { addNotification } = useNotifications();

    const getStoredProfile = async (email) => {
        try {
            const profiles = await storage.getItem('user_profiles') || {};
            return profiles[email.toLowerCase()];
        } catch (e) {
            return null;
        }
    };

    const saveToProfiles = async (userData) => {
        try {
            const profiles = await storage.getItem('user_profiles') || {};
            profiles[userData.email.toLowerCase()] = userData;
            await storage.setItem('user_profiles', profiles);
        } catch (e) {
            console.error('Error saving profile:', e);
        }
    };

    const login = async (userData) => {
        // Check if we have a stored profile for this email
        const existingProfile = await getStoredProfile(userData.email);
        const finalUser = existingProfile ? { ...existingProfile, ...userData } : userData;

        setUser(finalUser);
        await storage.setItem('user', finalUser);
        await saveToProfiles(finalUser);

        addNotification(
            'notifWelcomeBackTitle',
            'notifWelcomeBackMsg',
            'info',
            { name: finalUser.displayName || finalUser.email }
        );
    };

    const signup = async (userData) => {
        setUser(userData);
        await storage.setItem('user', userData);
        await saveToProfiles(userData);

        addNotification(
            'notifWelcomeNewTitle',
            'notifWelcomeNewMsg',
            'success',
            { name: userData.displayName }
        );
    };

    const logout = async () => {
        setUser(null);
        await storage.removeItem('user');
    };

    const updateUser = async (updates) => {
        if (!user) return;
        const newUser = { ...user, ...updates };
        setUser(newUser);
        await storage.setItem('user', newUser);
        await saveToProfiles(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default function AuthContextRoute() { return null; } 
