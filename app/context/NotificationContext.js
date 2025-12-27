/**
 * Notification Context - Kataraa
 * Manages user notifications, persistence, and state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!loading) {
            AsyncStorage.setItem('@kataraa_notifications', JSON.stringify(notifications));
        }
    }, [notifications, loading]);

    const loadNotifications = async () => {
        try {
            const saved = await AsyncStorage.getItem('@kataraa_notifications');
            if (saved) {
                setNotifications(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const addNotification = (title, message, type = 'info', params = {}) => {
        const newNotif = {
            id: Date.now().toString(),
            title,
            message,
            type,
            params,
            time: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            unreadCount,
            loading
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
