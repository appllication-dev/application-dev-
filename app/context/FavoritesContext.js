/**
 * Favorites Context - Kataraa
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('@kataraa_favorites', JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('@kataraa_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = React.useCallback((product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isFavorite = React.useCallback((productId) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  const clearFavorites = React.useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      loading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
