// ============================================
// 🔒 FIRESTORE SECURITY RULES
// ============================================
// Copy these rules to Firebase Console:
// 1. Go to Firebase Console
// 2. Click Firestore Database
// 3. Click "Rules" tab
// 4. Paste these rules and click "Publish"
// ============================================

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // 🔐 HELPER FUNCTIONS
    // ============================================
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user owns this document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Validate that a field is not changed
    function fieldUnchanged(field) {
      return !(field in request.resource.data) || 
        request.resource.data[field] == resource.data[field];
    }
    
    // ============================================
    // 👤 USERS COLLECTION
    // ============================================
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      
      // Users can create their own profile during registration
      allow create: if isOwner(userId) && 
        request.resource.data.role == 'customer' &&  // Can't create as admin
        request.resource.data.uid == userId;
      
      // Users can update their own profile (but not role)
      allow update: if isOwner(userId) && 
        fieldUnchanged('role') &&  // Can't change own role
        fieldUnchanged('uid') &&  // Can't change uid
        fieldUnchanged('email');  // Can't change email
      
      // Only admins can delete users
      allow delete: if isAdmin();
    }
    
    // ============================================
    // 📦 PRODUCTS COLLECTION
    // ============================================
    match /products/{productId} {
      // Anyone can read products
      allow read: if true;
      
      // Only admins can create/update/delete products
      allow create, update, delete: if isAdmin();
    }
    
    // ============================================
    // 🏷️ CATEGORIES COLLECTION
    // ============================================
    match /categories/{categoryId} {
      // Anyone can read categories
      allow read: if true;
      
      // Only admins can manage categories
      allow create, update, delete: if isAdmin();
    }
    
    // ============================================
    // 🛒 ORDERS COLLECTION
    // ============================================
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      
      // Authenticated users can create orders
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Only admins can update orders (for status changes)
      allow update: if isAdmin();
      
      // Orders cannot be deleted
      allow delete: if false;
    }
    
    // ============================================
    // ⭐ REVIEWS COLLECTION
    // ============================================
    match /reviews/{reviewId} {
      // Anyone can read reviews
      allow read: if true;
      
      // Authenticated users can create reviews
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Users can update/delete their own reviews
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // ============================================
    // 📍 ADDRESSES COLLECTION (nested under users)
    // ============================================
    match /users/{userId}/addresses/{addressId} {
      allow read, write: if isOwner(userId);
    }
    
    // ============================================
    // 💳 PAYMENT METHODS (nested under users)
    // ============================================
    match /users/{userId}/paymentMethods/{methodId} {
      allow read, write: if isOwner(userId);
    }
    
    // ============================================
    // 🔔 NOTIFICATIONS (nested under users)
    // ============================================
    match /users/{userId}/notifications/{notificationId} {
      allow read, write: if isOwner(userId);
    }
    
    // ============================================
    // 🛑 DENY ALL OTHER ACCESS
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/

// ============================================
// 📝 INSTRUCTIONS
// ============================================
// 
// 1. Go to Firebase Console: https://console.firebase.google.com
// 2. Select your project
// 3. Click "Firestore Database" in left menu
// 4. Click "Rules" tab at the top
// 5. Copy the rules above (without the /* */ comments)
// 6. Paste and click "Publish"
//
// ============================================
// 🔐 SECURITY FEATURES:
// ============================================
// ✅ Authentication required for sensitive operations
// ✅ Users can only access their own data
// ✅ Admin-only operations for product/category management
// ✅ Email and role fields are immutable for users
// ✅ Orders cannot be deleted (audit trail)
// ✅ Default deny - explicit permissions only
// ============================================

export const FIRESTORE_RULES_INFO = {
    version: '1.0.0',
    lastUpdated: '2024-12-07',
    features: [
        'User data protection',
        'Admin-only product management',
        'Secure order handling',
        'Immutable sensitive fields',
        'Default deny policy'
    ]
};

export default FIRESTORE_RULES_INFO;
