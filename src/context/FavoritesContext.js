import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { sanitizeEmail } from '../utils/helpers';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load favorites from storage on mount or user change
    useEffect(() => {
        loadFavorites();
    }, [user]);

    // Save favorites to storage whenever they change
    useEffect(() => {
        if (!loading && user) {
            saveFavorites();
        }
    }, [favorites, user]);

    const loadFavorites = async () => {
        if (!user) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        try {
            const key = `@favorites_storage_${sanitizeEmail(user.email)}`;
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
                setFavorites(JSON.parse(stored));
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.warn('Failed to load favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveFavorites = async () => {
        if (!user) return;
        try {
            const key = `@favorites_storage_${sanitizeEmail(user.email)}`;
            await AsyncStorage.setItem(key, JSON.stringify(favorites));
        } catch (error) {
            console.warn('Failed to save favorites:', error);
        }
    };

    const addToFavorites = (product) => {
        setFavorites(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) return prev;
            return [...prev, { ...product, isLiked: true }];
        });
    };

    const removeFromFavorites = (productId) => {
        setFavorites(prev => prev.filter(item => item.id !== productId));
    };

    const toggleFavorite = (product) => {
        const exists = favorites.find(item => item.id === product.id);
        if (exists) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(item => item.id === productId);
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addToFavorites,
                removeFromFavorites,
                toggleFavorite,
                isFavorite,
                clearFavorites,
                loading,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};
