/**
 * Services Index
 * Export all services for easy importing
 */

// Core API
export { default as api, setAuthToken, getAuthToken, removeAuthToken, retryRequest } from './api';

// Legacy services (REST API based)
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as orderService } from './orderService';
export { default as paymentService } from './paymentService';

// 🔥 FIRESTORE SERVICES (Firebase based)
export { default as firestoreProducts } from './firestoreProducts';
export { default as firestoreOrders } from './firestoreOrders';

// Firestore Products exports
export {
    getProducts as getFirestoreProducts,
    getProductById as getFirestoreProductById,
    getCategories as getFirestoreCategories,
    searchProducts as searchFirestoreProducts,
    getFeaturedProducts as getFirestoreFeaturedProducts,
    getNewArrivals as getFirestoreNewArrivals,
    seedProductsToFirestore,
    seedCategoriesToFirestore
} from './firestoreProducts';

// Firestore Orders exports
export {
    ORDER_STATUS,
    createOrder as createFirestoreOrder,
    getUserOrders,
    getOrderById as getFirestoreOrderById,
    updateOrderStatus,
    cancelOrder as cancelFirestoreOrder,
    getOrderTracking,
    clearLocalOrders
} from './firestoreOrders';

// Re-export individual functions for convenience
export {
    loginUser,
    registerUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
} from './authService';

export {
    getProducts,
    getProductById,
    getCategories,
    searchProducts,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    getProductReviews,
    addProductReview,
} from './productService';

export {
    getOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    trackOrder,
    reorder,
} from './orderService';

export {
    validateCardNumber,
    validateExpiry,
    validateCVV,
    validateCard,
    getCardType,
    createPaymentIntent,
    confirmPayment,
    getPaymentMethods,
    validatePromoCode,
    formatCardNumber,
    maskCardNumber,
} from './paymentService';
