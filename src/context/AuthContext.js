import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();
const USER_KEY = 'app_user';
const USERS_DB_KEY = 'app_users_db'; // Stores list of all registered users

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(USER_KEY);
        if (raw) {
          setUserState(JSON.parse(raw));
        } else {
          // No user logged in. We do NOT set a default user anymore to force login/register
          // or we can keep a "guest" mode if desired, but user asked for login/register flow.
          // For now, let's keep it null so we can show login screen.
        }
      } catch (e) {
        console.warn('Failed to load user from SecureStore', e);
      }
    })();
  }, []);

  const getUsersDB = async () => {
    try {
      const raw = await SecureStore.getItemAsync(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUsersDB = async (users) => {
    try {
      await SecureStore.setItemAsync(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users DB', e);
    }
  };

  const login = async (email, password) => {
    const users = await getUsersDB();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      // Remove password from session state for security
      const { password, ...userSession } = foundUser;
      setUserState(userSession);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const register = async (name, email, password) => {
    const users = await getUsersDB();
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser = { name, email, password };
    users.push(newUser);
    await saveUsersDB(users);

    // Auto login after register? Or redirect to login? 
    // User requested "reset settings for new user", which implies clean slate.
    // Let's NOT auto-login, but return true so UI can navigate to Login.
    return true;
  };

  const logout = async () => {
    setUserState(null);
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('Failed to delete user from SecureStore', e);
    }
  };

  const updateUser = async (updates) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUserState(updatedUser);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

    // Also update in DB
    const users = await getUsersDB();
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      // Keep password
      users[index] = { ...users[index], ...updates };
      await saveUsersDB(users);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
