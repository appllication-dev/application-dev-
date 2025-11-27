export const sanitizeEmail = (email) => {
    if (!email) return '';
    // Replace @ and other invalid characters with underscore to be safe for SecureStore and AsyncStorage keys
    return email.replace(/[^a-zA-Z0-9._-]/g, '_');
};
