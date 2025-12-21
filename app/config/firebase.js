/**
 * Firebase Configuration - Secure Setup
 * ⚠️ IMPORTANT: Replace the placeholder values with your actual Firebase config
 * Get these from: Firebase Console → Project Settings → General → Your apps
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  enableIndexedDbPersistence,
  increment // Added
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 🔑 FIREBASE CONFIGURATION
// ============================================
// ⚠️ Replace with YOUR Firebase project credentials
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// ============================================
// 🚀 INITIALIZE FIREBASE
// ============================================
let app;
let auth;
let db;

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('YOUR_');
};

import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Firestore (12.6.0): enableIndexedDbPersistence() will be deprecated',
  'Firestore (12.6.0): Error using user provided cache',
  'WARNING: Multiple instances of Three.js',
  'Firestore persistence failed',
  'Firestore persistence not available'
]);

// ... existing imports ...

// Initialize only if configured
if (isFirebaseConfigured()) {
  try {
    // Initialize app (avoid duplicate initialization)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Initialize Auth with persistence for React Native
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      // Auth might already be initialized
      auth = getAuth(app);
    }

    // Initialize Firestore
    db = getFirestore(app);

    // Enable offline persistence (Attempt only, silence failure in Expo Go)
    enableIndexedDbPersistence(db).catch((err) => {
      // Silent catch for development environments where indexedDB is missing
      // This prevents the scary red error screen or persistent warnings
    });

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Using demo mode.');
  // Create empty placeholders for demo mode
  app = null;
  auth = null;
  db = null;
}

// ============================================
// 🔒 SECURITY HELPER FUNCTIONS
// ============================================

/**
 * Sanitize user input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .slice(0, 500); // Limit length
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return {
    isValid: minLength && hasUpper && hasLower && hasNumber,
    errors: [
      !minLength && 'Password must be at least 8 characters',
      !hasUpper && 'Password must contain an uppercase letter',
      !hasLower && 'Password must contain a lowercase letter',
      !hasNumber && 'Password must contain a number'
    ].filter(Boolean)
  };
};

// ============================================
// 🔐 AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user with email and password
 */
export const signUpUser = async (email, password, displayName) => {
  if (!auth) {
    throw new Error('Firebase not configured. Please add your Firebase credentials.');
  }

  // Validate inputs
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  const sanitizedName = sanitizeInput(displayName);

  if (!isValidEmail(sanitizedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  const passwordCheck = isStrongPassword(password);
  if (!passwordCheck.isValid) {
    throw new Error(passwordCheck.errors.join('. '));
  }

  try {
    // Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    const user = userCredential.user;

    // Update profile (best effort)
    try {
      await updateProfile(user, { displayName: sanitizedName });
    } catch (e) { console.log('Profile name update incomplete', e); }

    // Create user document in Firestore - NON-BLOCKING / TIMEOUT PROTECTED
    // We don't want to fail registration if the DB save is slow, because the Auth User is already created!
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore Timeout')), 2000));

      await Promise.race([
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: sanitizedEmail,
          displayName: sanitizedName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'customer',
          isActive: true,
          preferences: { notifications: true, newsletter: false }
        }),
        timeoutPromise
      ]);
    } catch (firestoreError) {
      console.warn('⚠️ Firestore profile creation timed out (Non-critical):', firestoreError.message);
      // We continue! User is created.
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: sanitizedName
      }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with email and password
 */
export const signInUser = async (email, password) => {
  if (!auth) {
    throw new Error('Firebase not configured. Please add your Firebase credentials.');
  }

  const sanitizedEmail = sanitizeInput(email).toLowerCase();

  if (!isValidEmail(sanitizedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    // 1. Perform Auth Sign In
    console.log('📡 [firebase.js] calling signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    console.log('✅ [firebase.js] signInWithEmailAndPassword success');
    const user = userCredential.user;
    let userData = {};

    // 2. Try to update/fetch Firestore (With timeout to prevent hanging)
    console.log('🔥 [firebase.js] Auth successful, starting Firestore sync...');
    try {
      const userRef = doc(db, 'users', user.uid);

      // Create a timeout promise (5 seconds max for Firestore)
      const firestoreTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore Sync Timeout')), 5000);
      });

      // Define the sync operation
      const syncOperation = async () => {
        // Use setDoc with merge: true
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          email: user.email,
          uid: user.uid
        }, { merge: true });

        // Get user data
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      };

      // Race them
      await Promise.race([syncOperation(), firestoreTimeout]);
      console.log('✅ [firebase.js] Firestore sync complete');

    } catch (firestoreError) {
      console.warn('⚠️ [firebase.js] Firestore profile sync warning:', firestoreError.message);
      // We continue even if Firestore fails/times out, because Auth succeeded
    }

    // 3. Return success with what we have
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.displayName,
        ...userData
      }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google Credential
 */
export const signInWithGoogle = async (idToken) => {
  if (!auth) {
    throw new Error('Firebase not configured.');
  }

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    let userData = { displayName: user.displayName };

    // Non-blocking Firestore Sync
    try {
      const userRef = doc(db, 'users', user.uid);

      // Use setDoc with merge for safety
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp(),
        // Only set createdAt if creating new
        ...(user.metadata.creationTime === user.metadata.lastSignInTime ? { createdAt: serverTimestamp(), role: 'customer', isActive: true } : {})
      }, { merge: true });

      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } catch (firestoreError) {
      console.warn('Firestore sync failed during Google Sign-In (non-critical):', firestoreError);
      // Continue without failing auth
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName,
        photoURL: user.photoURL,
        ...userData
      }
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  if (!auth) return { success: true };

  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

/**
 * Reset password via email
 */
export const resetPassword = async (email) => {
  if (!auth) {
    throw new Error('Firebase not configured');
  }

  const sanitizedEmail = sanitizeInput(email).toLowerCase();

  if (!isValidEmail(sanitizedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    await sendPasswordResetEmail(auth, sanitizedEmail);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Change password for logged in user
 */
export const changeUserPassword = async (currentPassword, newPassword) => {
  if (!auth || !auth.currentUser) {
    throw new Error('No user logged in');
  }

  const passwordCheck = isStrongPassword(newPassword);
  if (!passwordCheck.isValid) {
    throw new Error(passwordCheck.errors.join('. '));
  }

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    // Re-authenticate user
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Password change error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
  if (!auth || !auth.currentUser || !db) {
    throw new Error('No user logged in');
  }

  try {
    const user = auth.currentUser;

    // Update Auth profile if displayName provided
    if (updates.displayName) {
      await updateProfile(user, {
        displayName: sanitizeInput(updates.displayName)
      });
    }

    // Update Firestore document
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * Delete user account
 */
export const deleteUserAccount = async (password) => {
  if (!auth || !auth.currentUser || !db) {
    throw new Error('No user logged in');
  }

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);

    // Re-authenticate
    await reauthenticateWithCredential(user, credential);

    // Delete Firestore data
    await deleteDoc(doc(db, 'users', user.uid));

    // Delete user account
    await deleteUser(user);

    return { success: true };
  } catch (error) {
    console.error('Account deletion error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Listen to auth state changes
 */
export const subscribeToAuthChanges = (callback) => {
  if (!auth) {
    callback(null);
    return () => { };
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userData.displayName,
          ...userData
        });
      } catch (error) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

// ============================================
// 🛡️ ERROR HANDLING
// ============================================

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

// ============================================
// 📦 EXPORTS
// ============================================

export {
  app,
  auth,
  db,
  isFirebaseConfigured,
  // Firestore utilities
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment // Added
};

export default {
  app,
  auth,
  db,
  isFirebaseConfigured,
  signUpUser,
  signInUser,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  changeUserPassword,
  updateUserProfile,
  deleteUserAccount,
  subscribeToAuthChanges,
  getCurrentUser
};
