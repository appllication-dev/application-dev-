import { createContext, useState, useContext } from 'react';

export const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const signIn = async (email, password) => {
        console.log('Firebase is currently disabled. Mock login for:', email);
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        return { success: true, user: { email, uid: 'mock-uid' } };
    };

    const signUp = async (email, password, displayName) => {
        console.log('Firebase is currently disabled. Mock signup for:', email);
        return { success: true, user: { email, displayName, uid: 'mock-uid' } };
    };

    const signOut = async () => {
        setUser(null);
        return { success: true };
    };

    const resetPassword = async (email) => {
        return { success: true };
    };

    const updateProfile = async (updates) => {
        return { success: true };
    };

    const value = {
        user,
        loading,
        initializing: false,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
    };

    return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

export const useFirebaseAuth = () => {
    const context = useContext(FirebaseAuthContext);
    if (!context) {
        throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
    }
    return context;
};
