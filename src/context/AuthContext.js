/**
 * Authentication Context with Firebase
 * Secure auth state management with Firebase Authentication
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import {
  signUpUser,
  signInUser,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  changeUserPassword,
  updateUserProfile,
  deleteUserAccount,
  subscribeToAuthChanges,
  getCurrentUser,
  isFirebaseConfigured
} from '../../app/config/firebase';
import { rateLimiters } from '../utils/security';
import { hashPassword, verifyPassword, isHashed } from '../utils/passwordHash';

// Create context
const AuthContext = createContext(null);

// Storage keys for local fallback
const USER_KEY = 'app_user';
const USERS_DB_KEY = 'app_users_db';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);

  // Initialize - check Firebase or use local mode
  useEffect(() => {
    const firebaseEnabled = isFirebaseConfigured();
    setIsFirebaseMode(firebaseEnabled);

    if (firebaseEnabled) {
      // Use Firebase auth state listener
      const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Use local storage for demo mode
      loadLocalUser();
    }
  }, []);

  // Load user from local storage (demo mode)
  const loadLocalUser = async () => {
    try {
      const raw = await storage.getItem(USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Failed to load user from SecureStore', e);
    } finally {
      setLoading(false);
    }
  };

  // Get local users database
  const getLocalUsersDB = async () => {
    try {
      const raw = await storage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  // Save local users database
  const saveLocalUsersDB = async (users) => {
    try {
      await storage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users DB', e);
    }
  };

  /**
   * Register new user
   */
  const register = useCallback(async (name, email, password) => {
    // Rate limiting check
    if (!rateLimiters.register.isAllowed(email)) {
      const waitTime = Math.ceil(rateLimiters.register.getTimeUntilReset(email) / 1000);
      throw new Error(`Too many attempts. Please wait ${waitTime} seconds.`);
    }

    if (isFirebaseMode) {
      try {
        const result = await signUpUser(email, password, name);
        setUser(result.user);
        return { success: true, user: result.user };
      } catch (error) {
        throw error;
      }
    } else {
      // Local registration (demo mode)
      const users = await getLocalUsersDB();

      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        uid: `local_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        displayName: name.trim(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await saveLocalUsersDB(users);

      // Auto login
      const { password: _, ...userSession } = newUser;
      setUser(userSession);
      await storage.setItem(USER_KEY, JSON.stringify(userSession));

      return { success: true, user: userSession };
    }
  }, [isFirebaseMode]);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    // Rate limiting check
    if (!rateLimiters.login.isAllowed(email)) {
      const waitTime = Math.ceil(rateLimiters.login.getTimeUntilReset(email) / 1000);
      throw new Error(`Too many login attempts. Please wait ${waitTime} seconds.`);
    }

    // 🚨 DEV BYPASS: Allow immediate access
    if (email.toLowerCase() === 'admin@admin.com' && password === 'admin123') {
      const adminUser = {
        uid: 'dev_admin_bypass',
        email: 'admin@admin.com',
        displayName: 'Dev Admin',
        photoURL: null
      };
      setUser(adminUser);
      // Persist bypass session
      await storage.setItem(USER_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    if (isFirebaseMode) {
      try {
        const result = await signInUser(email, password);
        setUser(result.user);
        return { success: true, user: result.user };
      } catch (error) {
        throw error;
      }
    } else {
      // Local login (demo mode)
      const users = await getLocalUsersDB();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('No account found with this email');
      }

      let passwordMatches = false;

      // Check if password is hashed
      if (isHashed(foundUser.password)) {
        passwordMatches = await verifyPassword(password, foundUser.password);
      } else {
        // Plain text (old format) - direct comparison
        passwordMatches = foundUser.password === password;
        if (passwordMatches) {
          // Upgrade to hashed format
          foundUser.password = await hashPassword(password);
          await saveLocalUsersDB(users);
        }
      }

      if (!passwordMatches) {
        throw new Error('Incorrect password');
      }

      const { password: _, ...userSession } = foundUser;
      setUser(userSession);
      await storage.setItem(USER_KEY, JSON.stringify(userSession));

      return { success: true, user: userSession };
    }
  }, [isFirebaseMode]);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (idToken) => {
    if (isFirebaseMode) {
      try {
        const result = await signInWithGoogle(idToken);
        setUser(result.user);
        return { success: true, user: result.user };
      } catch (error) {
        throw error;
      }
    } else {
      console.warn("Google Sign In not supported in local demo mode without mocks.");
      return { success: false, error: "Not supported in local mode" };
    }
  }, [isFirebaseMode]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    if (isFirebaseMode) {
      await signOutUser();
    }

    setUser(null);

    try {
      await storage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Failed to delete user from SecureStore', e);
    }

    return { success: true };
  }, [isFirebaseMode]);

  /**
   * Update user profile
   */
  const updateUser = useCallback(async (updates) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (isFirebaseMode) {
      await updateUserProfile(updates);
    }

    // Update local state
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await storage.setItem(USER_KEY, JSON.stringify(updatedUser));

    // Update in local DB if not Firebase
    if (!isFirebaseMode) {
      const users = await getLocalUsersDB();
      const index = users.findIndex(u => u.email === user.email);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        await saveLocalUsersDB(users);
      }
    }

    return { success: true, user: updatedUser };
  }, [user, isFirebaseMode]);

  /**
   * Send password reset email
   */
  const forgotPassword = useCallback(async (email) => {
    if (isFirebaseMode) {
      return await resetPassword(email);
    } else {
      // Demo mode - just show success message
      console.log('Demo mode: Password reset for', email);
      return {
        success: true,
        message: 'If an account exists, a reset link will be sent.'
      };
    }
  }, [isFirebaseMode]);

  /**
   * Change password
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (isFirebaseMode) {
      return await changeUserPassword(currentPassword, newPassword);
    } else {
      // Local password change
      if (!user) {
        throw new Error('No user logged in');
      }

      const users = await getLocalUsersDB();
      const userIndex = users.findIndex(u => u.email === user.email);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const storedUser = users[userIndex];
      const isCorrect = await verifyPassword(currentPassword, storedUser.password);

      if (!isCorrect) {
        throw new Error('Current password is incorrect');
      }

      users[userIndex].password = await hashPassword(newPassword);
      await saveLocalUsersDB(users);

      return { success: true, message: 'Password updated successfully' };
    }
  }, [user, isFirebaseMode]);

  /**
   * Delete account
   */
  const deleteAccount = useCallback(async (password) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (isFirebaseMode) {
      await deleteUserAccount(password);
    } else {
      // Verify password first
      const users = await getLocalUsersDB();
      const storedUser = users.find(u => u.email === user.email);

      if (storedUser) {
        const isCorrect = await verifyPassword(password, storedUser.password);
        if (!isCorrect) {
          throw new Error('Incorrect password');
        }

        // Remove from DB
        const filteredUsers = users.filter(u => u.email !== user.email);
        await saveLocalUsersDB(filteredUsers);
      }
    }

    setUser(null);
    await storage.removeItem(USER_KEY);

    return { success: true };
  }, [user, isFirebaseMode]);

  /**
   * Clear all local data (development use)
   */
  const clearAllUsers = useCallback(async () => {
    try {
      await storage.removeItem(USERS_DB_KEY);
      await storage.removeItem(USER_KEY);
      setUser(null);
      console.log('All local users cleared');
      return { success: true };
    } catch (e) {
      console.warn('Failed to clear users', e);
      return { success: false, error: e.message };
    }
  }, []);

  // Context value
  const value = {
    // State
    user,
    loading,
    isAuthenticated: !!user,
    isFirebaseMode,

    // Actions
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    forgotPassword,
    changePassword,
    deleteAccount,
    clearAllUsers,

    // Utilities
    getCurrentUser: () => isFirebaseMode ? getCurrentUser() : user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
