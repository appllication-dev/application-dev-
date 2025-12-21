/**
 * Firestore Products Service
 * Secure product data management with Firestore
 */
import {
    db,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc, // New
    deleteDoc, // New
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    isFirebaseConfigured
} from '../../app/config/firebase';

// Import local data as fallback
import localData from '../../app/data/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'products_data';
const localProducts = localData; // Aliasing for compatibility

// Helper to save local products
const saveLocalProducts = async (products) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        // Update in-memory reference to keep sync
        localProducts.products = products;
    } catch (error) {
        console.error('Failed to save products locally:', error);
    }
};

// Helper to load local products
const loadLocalProducts = async () => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            localProducts.products = parsed;
            return parsed;
        }
    } catch (error) {
        console.error('Failed to load local products:', error);
    }
    // Fallback to initial seed
    return localProducts.products || [];
};

// Collection reference
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Refill all products stock (Admin Utility)
 * Sets a default stock for all products that don't have it or resets it.
 */
export const refillAllProductsStock = async (defaultStock = 50) => {
    if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase not configured' };

    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        const updates = [];

        querySnapshot.forEach((docSnap) => {
            const productRef = doc(db, PRODUCTS_COLLECTION, docSnap.id);
            // Update every product to have stock
            updates.push(updateDoc(productRef, {
                stock: defaultStock,
                lowStockThreshold: 5,
                updatedAt: serverTimestamp()
            }));
        });

        await Promise.all(updates);
        return { success: true, count: updates.length };
    } catch (error) {
        console.error('Error refilling stock:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update product stock
 */
export const updateProductStock = async (productId, newStock) => {
    if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firebase not configured' };

    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        await updateDoc(productRef, {
            stock: parseInt(newStock),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if product has enough stock
 */
export const checkStockAvailability = async (productId, quantity) => {
    if (!isFirebaseConfigured() || !db) {
        // Fallback to local data check
        const product = localData.products.find(p => p.id === productId);
        if (product) {
            return {
                available: (product.stock || 0) >= quantity,
                currentStock: product.stock || 0
            };
        }
        return { available: true, currentStock: 999 }; // Assume available if no data
    }

    try {
        const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
        if (productDoc.exists()) {
            const currentStock = productDoc.data().stock || 0;
            return {
                available: currentStock >= quantity,
                currentStock
            };
        }
        return { available: false, error: 'Product not found' };
    } catch (error) {
        console.error('Error checking stock:', error);
        return { available: false, error: error.message };
    }
};


export const getProducts = async (options = {}) => {
    // ... options destructuring ...
    const {
        categoryId = null,
        sortField = 'createdAt',
        sortDirection = 'desc',
        limitCount = 50,
        onlyInStock = false,
        minPrice = null,
        maxPrice = null,
        minRating = null,
        sortOf = 'newest' // Default to newest to prevent ReferenceError
    } = options;

    console.log('🔄 getProducts called. localData available:', !!localData, 'Items:', localData?.products?.length);

    // ... (rest of function)

    // Use local data if Firebase not configured
    if (!isFirebaseConfigured() || !db) {
        console.log('📦 Using persistent local product data');
        // Load from storage first
        let products = await loadLocalProducts();

        if (categoryId) {
            products = products.filter(p => p.category === categoryId);
        }

        if (onlyInStock) {
            products = products.filter(p => p.stock > 0);
        }

        if (minPrice !== null) {
            products = products.filter(p => (parseFloat(p.price) || 0) >= minPrice);
        }
        if (maxPrice !== null) {
            products = products.filter(p => (parseFloat(p.price) || 0) <= maxPrice);
        }
        if (minRating !== null) {
            products = products.filter(p => (p.rating?.rate || 0) >= minRating);
        }

        return {
            success: true,
            products,
            source: 'local'
        };
    }

    try {
        let q = collection(db, PRODUCTS_COLLECTION);
        const constraints = [];

        if (categoryId) {
            constraints.push(where('category', '==', categoryId));
        }

        if (onlyInStock) {
            constraints.push(where('stock', '>', 0));
        }

        // Note: Firestore requires composite indexes for range filters on different fields
        // For simplicity in this demo, we might filter price/rating client-side if dataset is small
        // OR we assume indexes exist. Let's do client-side filtering for complex combos to avoid index errors for now
        // unless it's a simple single-field range.

        // We will apply sort and limit here, but price/rating filtering might happen after fetch if we want to avoid index hell
        // or we add them if we are sure.

        if (minPrice !== null) constraints.push(where('price', '>=', minPrice));
        if (maxPrice !== null) constraints.push(where('price', '<=', maxPrice));
        // if (minRating !== null) constraints.push(where('rating.rate', '>=', minRating)); // Nested field might need special index

        constraints.push(orderBy(sortField, sortDirection));
        constraints.push(limit(limitCount));

        q = query(q, ...constraints);

        // Race Firestore against timeout (silent fail to local)
        // Reduced to 1.5s for snappy UI ("Heavy" feeling fix)
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));

        const snapshot = await Promise.race([
            getDocs(q),
            timeoutPromise
        ]);

        let firestoreProducts = [];
        if (snapshot !== 'timeout') {
            firestoreProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            console.log('⚠️ Firestore products fetch timed out, checking local...');
        }

        // Merge with Local Data (Offline-First Strategy)
        const localItems = await loadLocalProducts();

        // Filter local items based on query params to match Firestore behavior
        let filteredLocal = localItems;
        if (categoryId) filteredLocal = filteredLocal.filter(p => p.category === categoryId);
        if (onlyInStock) filteredLocal = filteredLocal.filter(p => p.stock > 0);

        // Combine: Firestore results + Local (deduplicated by ID)
        const mergedMap = new Map();

        // Helper to normalize product date for sorting
        const getProductDate = (p) => {
            // Check for Firestore Timestamp
            if (p.createdAt && typeof p.createdAt === 'object' && typeof p.createdAt.toDate === 'function') {
                return p.createdAt.toDate().getTime();
            }
            // Check for ISO String or Date String
            if (p.createdAt && typeof p.createdAt === 'string') {
                return new Date(p.createdAt).getTime();
            }
            // Fallback to updated_at if created_at is missing?
            if (p.updatedAt && typeof p.updatedAt === 'object' && typeof p.updatedAt.toDate === 'function') {
                return p.updatedAt.toDate().getTime();
            }
            return 0; // Fallback
        };

        // 1. Add Firestore items (normalized)
        firestoreProducts.forEach(p => {
            mergedMap.set(p.id.toString(), {
                ...p,
                // Normalize Date for consistent UI usage
                createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : p.createdAt
            });
        });

        // 2. Add Local items (New items override or fill gaps)
        filteredLocal.forEach(p => {
            // If local item is MORE RECENT than firestore item (pending sync?), we might want to prefer it
            if (!mergedMap.has(p.id.toString())) {
                mergedMap.set(p.id.toString(), p);
            }
        });

        const mergedProducts = Array.from(mergedMap.values());

        // Re-sort normalized list
        mergedProducts.sort((a, b) => {
            // Get millis for comparison
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            // 'newest' means larger timestamp first (Descending)
            if (sortOf === 'newest') {
                return dateB - dateA;
            }
            // 'oldest' (Ascending)
            if (sortOf === 'oldest') {
                return dateA - dateB;
            }
            // 'price_high'
            if (sortOf === 'price_high') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
            // 'price_low'
            if (sortOf === 'price_low') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);

            return 0;
        });

        // Re-limit
        const finalProducts = mergedProducts.slice(0, limitCount);

        return {
            success: true,
            products: finalProducts,
            source: snapshot === 'timeout' ? 'mixed-timeout' : 'firestore-mixed'
        };
    } catch (error) {
        console.warn('⚠️ Fetching from Firestore failed (using local data):', error.message);

        // Fallback to local data on error
        return {
            success: true,
            products: localProducts.products || [],
            source: 'local-fallback',
            error: error.message
        };
    }
};

/**
 * Get single product by ID
 */
export const getProductById = async (productId) => {
    if (!productId) {
        throw new Error('Product ID is required');
    }

    // Use local data if Firebase not configured
    if (!isFirebaseConfigured() || !db) {
        const product = (localProducts.products || []).find(
            p => p.id.toString() === productId.toString()
        );

        if (!product) {
            throw new Error('Product not found');
        }

        return {
            success: true,
            product,
            source: 'local'
        };
    }

    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId.toString());
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Try local fallback
            const localProduct = (localProducts.products || []).find(
                p => p.id.toString() === productId.toString()
            );

            if (localProduct) {
                return {
                    success: true,
                    product: localProduct,
                    source: 'local-fallback'
                };
            }

            throw new Error('Product not found');
        }

        return {
            success: true,
            product: { id: docSnap.id, ...docSnap.data() },
            source: 'firestore'
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
    // Default categories
    const defaultCategories = [
        { id: 'all', name: 'All', icon: 'apps' },
        { id: 'T-shirt', name: 'T-Shirts', icon: 'shirt' },
        { id: 'Hoodie', name: 'Hoodies', icon: 'layers' },
        { id: 'Discount', name: 'On Sale', icon: 'pricetag' },
        { id: 'Hat', name: 'Accessories', icon: 'glasses' }
    ];

    if (!isFirebaseConfigured() || !db) {
        return {
            success: true,
            categories: defaultCategories,
            source: 'default'
        };
    }

    try {
        const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return {
                success: true,
                categories: defaultCategories,
                source: 'default-fallback'
            };
        }

        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            categories,
            source: 'firestore'
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            success: true,
            categories: defaultCategories,
            source: 'default-error-fallback'
        };
    }
};

/**
 * Search products
 */
export const searchProducts = async (searchQuery, options = {}) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
        return { success: true, products: [] };
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();

    // For local data
    if (!isFirebaseConfigured() || !db) {
        const products = (localProducts.products || []).filter(product =>
            product.title?.toLowerCase().includes(normalizedQuery) ||
            product.category?.toLowerCase().includes(normalizedQuery)
        );

        return {
            success: true,
            products,
            source: 'local'
        };
    }

    try {
        // Note: Firestore doesn't support full-text search natively
        // For production, consider using Algolia or Elasticsearch
        // This is a basic implementation using array-contains

        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('searchKeywords', 'array-contains', normalizedQuery),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            products,
            source: 'firestore'
        };
    } catch (error) {
        console.error('Search error:', error);

        // Fallback to local search
        const products = (localProducts.products || []).filter(product =>
            product.title?.toLowerCase().includes(normalizedQuery) ||
            product.category?.toLowerCase().includes(normalizedQuery)
        );

        return {
            success: true,
            products,
            source: 'local-fallback'
        };
    }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limitCount = 10) => {
    if (!isFirebaseConfigured() || !db) {
        // Return first few products as featured
        const products = (localProducts.products || []).slice(0, limitCount);
        return { success: true, products, source: 'local' };
    }

    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('isFeatured', '==', true),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, products, source: 'firestore' };
    } catch (error) {
        console.error('Error fetching featured products:', error);
        const products = (localProducts.products || []).slice(0, limitCount);
        return { success: true, products, source: 'local-fallback' };
    }
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (limitCount = 10) => {
    if (!isFirebaseConfigured() || !db) {
        const products = [...(localProducts.products || [])]
            .reverse()
            .slice(0, limitCount);
        return { success: true, products, source: 'local' };
    }

    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, products, source: 'firestore' };
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        const products = [...(localProducts.products || [])]
            .reverse()
            .slice(0, limitCount);
        return { success: true, products, source: 'local-fallback' };
    }
};

/**
 * Seed products to Firestore (Admin function)
 * Call this once to populate your Firestore database
 */
export const seedProductsToFirestore = async () => {
    if (!isFirebaseConfigured() || !db) {
        throw new Error('Firebase not configured');
    }

    try {
        // Ensure we have the latest local data (including user-added products)
        await loadLocalProducts();
        const products = localProducts.products || [];

        for (const product of products) {
            const productId = product.id.toString();
            const productData = {
                ...product,
                id: productId,
                searchKeywords: [
                    product.title?.toLowerCase(),
                    product.category?.toLowerCase(),
                    ...product.title?.toLowerCase().split(' ') || []
                ].filter(Boolean),
                isFeatured: Math.random() > 0.5,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, PRODUCTS_COLLECTION, productId), productData);
        }

        console.log(`✅ Seeded ${products.length} products to Firestore`);
        return { success: true, count: products.length };
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
};

/**
 * Seed categories to Firestore (Admin function)
 */
export const seedCategoriesToFirestore = async () => {
    if (!isFirebaseConfigured() || !db) {
        throw new Error('Firebase not configured');
    }

    const categories = [
        { id: 'all', name: 'All', icon: 'apps', order: 0 },
        { id: 'T-shirt', name: 'T-Shirts', icon: 'shirt', order: 1 },
        { id: 'Hoodie', name: 'Hoodies', icon: 'layers', order: 2 },
        { id: 'Discount', name: 'On Sale', icon: 'pricetag', order: 3 },
        { id: 'Hat', name: 'Accessories', icon: 'glasses', order: 4 }
    ];

    try {
        for (const category of categories) {
            await setDoc(doc(db, CATEGORIES_COLLECTION, category.id), {
                ...category,
                createdAt: serverTimestamp()
            });
        }

        console.log(`✅ Seeded ${categories.length} categories to Firestore`);
        return { success: true, count: categories.length };
    } catch (error) {
        console.error('Error seeding categories:', error);
        throw error;
    }
};
/**
 * Add a new product (Admin)
 */
export const addProduct = async (productData) => {
    if (!isFirebaseConfigured() || !db) {
        console.log('📦 Adding product to local storage');

        const newProduct = {
            id: Date.now().toString(), // Use timestamp for unique ID
            ...productData,
            createdAt: new Date().toISOString(), // Store as string for JSON safety
        };

        const currentProducts = await loadLocalProducts();
        const updatedProducts = [newProduct, ...currentProducts];

        await saveLocalProducts(updatedProducts);

        return { success: true, id: newProduct.id, source: 'local-persistence' };
    }

    // 1. ALWAYS Save locally first ("Saved Forever")
    // Use setDoc pattern (Custom ID) so identifiers match locally and remotely
    const newId = Date.now().toString(); // Simple numeric-string ID

    const newProduct = {
        ...productData,
        id: newId,
        searchKeywords: [
            productData.title?.toLowerCase(),
            productData.category?.toLowerCase(),
            ...(productData.title?.toLowerCase().split(' ') || [])
        ].filter(Boolean),
        createdAt: new Date().toISOString(), // Local format
        updatedAt: new Date().toISOString(),
        synced: false
    };

    try {
        const currentProducts = await loadLocalProducts();
        const updatedProducts = [newProduct, ...currentProducts];
        await saveLocalProducts(updatedProducts);

        if (!isFirebaseConfigured() || !db) {
            return { success: true, id: newId, source: 'local-persistence-only' };
        }

        // 2. Try to sync to Firestore
        try {
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));

            // USE setDoc with the SAME ID, not addDoc
            const docRef = doc(db, PRODUCTS_COLLECTION, newId);

            const result = await Promise.race([
                setDoc(docRef, {
                    ...newProduct,
                    createdAt: serverTimestamp(), // Use server timestamp for remote
                    updatedAt: serverTimestamp()
                }),
                timeoutPromise
            ]);

            if (result === 'timeout') {
                console.log('⚠️ Firestore product sync timed out (saved locally)');
                return { success: true, id: newId, source: 'local-persistence-timeout' };
            }

            return { success: true, id: newId, source: 'firestore-synced' };
        } catch (fsError) {
            console.warn('⚠️ Firestore sync failed (saved locally):', fsError.message);
            return { success: true, id: newId, source: 'local-persistence-fallback' };
        }

    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to save product locally');
    }
};

/**
 * Update a product (Admin)
 */
export const updateProduct = async (id, productData) => {
    if (!id) throw new Error('Product ID required');

    if (!isFirebaseConfigured() || !db) {
        console.log('📦 Updating product in local storage');
        const currentProducts = await loadLocalProducts();
        const updatedProducts = currentProducts.map(p =>
            p.id.toString() === id.toString() ? { ...p, ...productData } : p
        );

        await saveLocalProducts(updatedProducts);
        return { success: true, source: 'local-persistence' };
    }

    // 1. Update Locally
    try {
        const currentProducts = await loadLocalProducts();
        const updatedProducts = currentProducts.map(p =>
            p.id.toString() === id.toString() ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
        );
        await saveLocalProducts(updatedProducts);

        if (!isFirebaseConfigured() || !db) {
            return { success: true, source: 'local-persistence-only' };
        }

        // 2. Sync Update
        try {
            // We don't block for long
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));

            const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
            const result = await Promise.race([
                updateDoc(docRef, {
                    ...productData,
                    searchKeywords: [
                        productData.title?.toLowerCase(),
                        productData.category?.toLowerCase(),
                        ...(productData.title?.toLowerCase().split(' ') || [])
                    ].filter(Boolean),
                    updatedAt: serverTimestamp()
                }),
                timeoutPromise
            ]);

            if (result === 'timeout') return { success: true, source: 'local-persistence-timeout' };
            return { success: true, source: 'firestore-synced' };

        } catch (fsError) {
            console.warn('Firestore update failed (saved locally)');
            return { success: true, source: 'local-persistence-fallback' };
        }
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

/**
 * Delete a product (Admin)
 */
export const deleteProduct = async (id) => {
    if (!id) throw new Error('Product ID required');

    if (!isFirebaseConfigured() || !db) {
        console.log('📦 Deleting product from local storage');
        const currentProducts = await loadLocalProducts();
        const updatedProducts = currentProducts.filter(p => p.id.toString() !== id.toString());

        await saveLocalProducts(updatedProducts);
        return { success: true, source: 'local-persistence' };
    }

    // 1. Delete Locally
    try {
        const currentProducts = await loadLocalProducts();
        const updatedProducts = currentProducts.filter(p => p.id.toString() !== id.toString());
        await saveLocalProducts(updatedProducts);

        if (!isFirebaseConfigured() || !db) {
            return { success: true, source: 'local-persistence-only' };
        }

        // 2. Sync Delete
        try {
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));
            await Promise.race([
                deleteDoc(doc(db, PRODUCTS_COLLECTION, id.toString())),
                timeoutPromise
            ]);
            return { success: true, source: 'firestore-synced' };
        } catch (fsError) {
            console.warn('Firestore delete failed (deleted locally)');
            return { success: true, source: 'local-persistence-fallback' };
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

/**
 * Add a review to a product
 */
export const addProductReview = async (productId, reviewData) => {
    if (!productId) throw new Error('Product ID required');

    // 1. ALWAYS Save locally first for immediate persistence ("Saved Forever" guarantee)
    try {
        const reviewsKey = `reviews_${productId}`;
        const stored = await AsyncStorage.getItem(reviewsKey);
        const currentReviews = stored ? JSON.parse(stored) : [];

        // Assign a temporary local ID
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newReview = {
            id: localId,
            ...reviewData,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString(), // Store as string for JSON
            synced: false
        };

        const updatedReviews = [newReview, ...currentReviews];
        await AsyncStorage.setItem(reviewsKey, JSON.stringify(updatedReviews));

        // If Firebase is disabled, we are done
        if (!isFirebaseConfigured() || !db) {
            return { success: true, id: localId, source: 'local-persistence-only' };
        }

        // 2. Try to sync to Firestore (but don't fail the operation if it hangs/fails)
        try {
            // We race against a silent timeout to avoid blocking the UI
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));

            const reviewsRef = collection(db, PRODUCTS_COLLECTION, productId.toString(), 'reviews');

            const result = await Promise.race([
                addDoc(reviewsRef, {
                    ...reviewData,
                    createdAt: serverTimestamp()
                }),
                timeoutPromise
            ]);

            if (result === 'timeout') {
                console.log('⚠️ Firestore review sync timed out (saved locally)');
                return { success: true, id: localId, source: 'local-persistence-timeout' };
            }

            // If success, we could optionally update the local item to mark it synced
            return { success: true, id: result.id, source: 'firestore-synced' };

        } catch (fsError) {
            console.warn('⚠️ Firestore sync failed (saved locally):', fsError.message);
            return { success: true, id: localId, source: 'local-persistence-fallback' };
        }

    } catch (error) {
        console.error('Error in review pipeline:', error);
        // If even local save fails, then we really have an error
        throw new Error('Failed to save review locally');
    }
};

/**
 * Delete a review from a product
 */
export const deleteProductReview = async (productId, reviewId) => {
    if (!productId || !reviewId) throw new Error('Product ID and Review ID required');

    if (!isFirebaseConfigured() || !db) {
        console.log('📦 Deleting review locally');
        try {
            const reviewsKey = `reviews_${productId}`;
            const stored = await AsyncStorage.getItem(reviewsKey);

            if (stored) {
                const currentReviews = JSON.parse(stored);
                // Filter out the review to delete
                const updatedReviews = currentReviews.filter(r => r.id !== reviewId);

                await AsyncStorage.setItem(reviewsKey, JSON.stringify(updatedReviews));
                return { success: true, source: 'local-persistence' };
            }
            return { success: false, error: 'Reviews not found' };
        } catch (error) {
            console.error('Error deleting local review:', error);
            return { success: false, error: error.message };
        }
    }

    try {
        const reviewRef = doc(db, PRODUCTS_COLLECTION, productId.toString(), 'reviews', reviewId);
        await deleteDoc(reviewRef);
        return { success: true, source: 'firestore' };
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
};

/**
 * Toggle Like on a Review
 */
export const toggleReviewLike = async (productId, reviewId, userId) => {
    if (!productId || !reviewId || !userId) throw new Error('Missing required params');

    const toggleLocal = async () => {
        try {
            const reviewsKey = `reviews_${productId}`;
            const stored = await AsyncStorage.getItem(reviewsKey);
            let updatedReviews = [];
            let isLiked = false;

            if (stored) {
                const currentReviews = JSON.parse(stored);
                updatedReviews = currentReviews.map(review => {
                    if (review.id === reviewId) {
                        const likedBy = review.likedBy || [];
                        const userIndex = likedBy.indexOf(userId);

                        if (userIndex > -1) {
                            // Unlike
                            review.likedBy = likedBy.filter(id => id !== userId);
                            review.likes = Math.max(0, (review.likes || 1) - 1);
                            isLiked = false;
                        } else {
                            // Like
                            review.likedBy = [...likedBy, userId];
                            review.likes = (review.likes || 0) + 1;
                            isLiked = true;
                        }
                    }
                    return review;
                });
                await AsyncStorage.setItem(reviewsKey, JSON.stringify(updatedReviews));
            }
            return { success: true, isLiked };
        } catch (error) {
            console.error('Error toggling local like:', error);
            throw error;
        }
    };

    // 1. Always update locally first
    const localResult = await toggleLocal();

    if (!isFirebaseConfigured() || !db) {
        return { ...localResult, source: 'local-only' };
    }

    // 2. Sync with Firestore
    try {
        const reviewRef = doc(db, PRODUCTS_COLLECTION, productId.toString(), 'reviews', reviewId);

        const docSnap = await getDoc(reviewRef);
        if (docSnap.exists()) {
            const reviewData = docSnap.data();
            const likedBy = reviewData.likedBy || [];
            const userIndex = likedBy.indexOf(userId);

            let updates = {};
            if (userIndex > -1) {
                // Remove
                const newLikedBy = likedBy.filter(id => id !== userId);
                updates = {
                    likedBy: newLikedBy,
                    likes: newLikedBy.length
                };
            } else {
                // Add
                const newLikedBy = [...likedBy, userId];
                updates = {
                    likedBy: newLikedBy,
                    likes: newLikedBy.length
                };
            }

            await updateDoc(reviewRef, updates);
            return { success: true, source: 'firestore-synced', isLiked: localResult.isLiked };
        }
    } catch (error) {
        console.warn('Firestore like sync failed (saved locally)');
        return { ...localResult, source: 'local-fallback' };
    }

    return localResult;
};

/**
 * Get local-only reviews (Fast)
 */
export const getLocalProductReviews = async (productId) => {
    try {
        const reviewsKey = `reviews_${productId}`;
        const stored = await AsyncStorage.getItem(reviewsKey);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId) => {
    if (!productId) return { success: true, reviews: [] };

    // 1. Get Local Reviews
    let localReviews = [];
    try {
        const reviewsKey = `reviews_${productId}`;
        const stored = await AsyncStorage.getItem(reviewsKey);
        localReviews = stored ? JSON.parse(stored) : [];
    } catch (e) { console.log('Error reading local reviews', e); }

    if (!isFirebaseConfigured() || !db) {
        return { success: true, reviews: localReviews, source: 'local-persistence' };
    }

    try {
        const reviewsRef = collection(db, PRODUCTS_COLLECTION, productId.toString(), 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));

        // Race fetch against timeout
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 1500));

        const snapshot = await Promise.race([
            getDocs(q),
            timeoutPromise
        ]);

        if (snapshot === 'timeout') {
            return { success: true, reviews: localReviews, source: 'local-fallback-timeout' };
        }

        const firestoreReviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()
            };
        });

        // MERGE: Combine local and firestore reviews, preferring Firestore if IDs match (unlikely if local IDs are "local_...")
        // Actually, we just want to show everything. Deduplication is hard without consistent IDs.
        // Simple strategy: Show combined list.
        // For a better UX, we could try to detect duplicates if we synced properly, but "redundant reviews" is better than "missing reviews".

        // Combine and sort by date (newest first)
        // Note: Real date parsing might be needed.
        const allReviews = [...localReviews, ...firestoreReviews];

        // Crude deduplication by text+user signature to avoid obvious dupes if sync happened silently?
        // Let's just return unique by ID.
        const seen = new Set();
        const uniqueReviews = allReviews.filter(r => {
            const key = r.id; // OR r.text + r.user for content dedupe?
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return { success: true, reviews: uniqueReviews, source: 'merged' };
    } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to local
        return { success: true, reviews: localReviews, source: 'local-error-fallback' };
    }
};

/**
 * Clear all local reviews (for development/reset purposes)
 */
export const clearAllLocalReviews = async () => {
    try {
        // Get all keys from AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();

        // Filter keys that start with 'reviews_'
        const reviewKeys = allKeys.filter(key => key.startsWith('reviews_'));

        // Delete all review keys
        if (reviewKeys.length > 0) {
            await AsyncStorage.multiRemove(reviewKeys);
            console.log(`✅ Cleared ${reviewKeys.length} review entries`);
        }

        return { success: true, clearedCount: reviewKeys.length };
    } catch (error) {
        console.error('Error clearing reviews:', error);
        return { success: false, error: error.message };
    }
};
