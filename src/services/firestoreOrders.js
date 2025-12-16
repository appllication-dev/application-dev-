/**
 * Firestore Orders Service
 * Secure order management with Firestore
 */
import {
    db,
    auth,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    isFirebaseConfigured
} from '../../app/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Collection names
const ORDERS_COLLECTION = 'orders';
const LOCAL_ORDERS_KEY = '@order_history';

// Order statuses
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${randomPart}`.toUpperCase();
};

/**
 * Create a new order
 */
export const createOrder = async (orderData) => {
    const {
        items,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        subtotal,
        shippingCost,
        discount = 0,
        promoCode = null,
        total
    } = orderData;

    // Validate required fields
    if (!items || items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    if (!shippingAddress || !shippingAddress.address) {
        throw new Error('Shipping address is required');
    }

    const orderId = generateOrderId();
    const currentUser = auth?.currentUser;

    const order = {
        orderId,
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || 'guest@example.com',
        items: items.map(item => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
        })),
        shippingAddress: {
            fullName: shippingAddress.name || shippingAddress.fullName,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country || 'USA',
            phone: shippingAddress.phone
        },
        paymentMethod: paymentMethod || 'card',
        shippingMethod: shippingMethod || 'standard',
        pricing: {
            subtotal,
            shippingCost: shippingCost || 0,
            discount: discount || 0,
            promoCode,
            total
        },
        status: ORDER_STATUS.PENDING,
        statusHistory: [
            {
                status: ORDER_STATUS.PENDING,
                timestamp: new Date().toISOString(),
                note: 'Order placed'
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // If Firebase is configured, save to Firestore
    if (isFirebaseConfigured() && db && currentUser) {
        try {
            await setDoc(doc(db, ORDERS_COLLECTION, orderId), {
                ...order,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log('✅ Order saved to Firestore:', orderId);
        } catch (error) {
            console.error('Error saving order to Firestore:', error);
            // Continue with local storage as fallback
        }
    }

    // Always save locally as backup
    try {
        const existingOrders = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.unshift(order); // Add to beginning
        await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.slice(0, 50))); // Keep last 50
    } catch (error) {
        console.error('Error saving order locally:', error);
    }

    return {
        success: true,
        order,
        orderId
    };
};

/**
 * Get user's orders
 */
export const getUserOrders = async (limitCount = 20) => {
    const currentUser = auth?.currentUser;

    // Try Firestore first
    if (isFirebaseConfigured() && db && currentUser) {
        try {
            const q = query(
                collection(db, ORDERS_COLLECTION),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                orders,
                source: 'firestore'
            };
        } catch (error) {
            console.error('Error fetching orders from Firestore:', error);
        }
    }

    // Fallback to local storage
    try {
        const localOrders = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
        const orders = localOrders ? JSON.parse(localOrders) : [];

        // Filter by user if logged in
        const userOrders = currentUser
            ? orders.filter(o => o.userId === currentUser.uid || o.userId === 'guest')
            : orders;

        return {
            success: true,
            orders: userOrders.slice(0, limitCount),
            source: 'local'
        };
    } catch (error) {
        console.error('Error fetching local orders:', error);
        return {
            success: true,
            orders: [],
            source: 'empty'
        };
    }
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId) => {
    if (!orderId) {
        throw new Error('Order ID is required');
    }

    // Try Firestore first
    if (isFirebaseConfigured() && db) {
        try {
            const docRef = doc(db, ORDERS_COLLECTION, orderId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    order: { id: docSnap.id, ...docSnap.data() },
                    source: 'firestore'
                };
            }
        } catch (error) {
            console.error('Error fetching order from Firestore:', error);
        }
    }

    // Fallback to local storage
    try {
        const localOrders = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
        const orders = localOrders ? JSON.parse(localOrders) : [];
        const order = orders.find(o => o.orderId === orderId);

        if (order) {
            return {
                success: true,
                order,
                source: 'local'
            };
        }
    } catch (error) {
        console.error('Error fetching local order:', error);
    }

    throw new Error('Order not found');
};

/**
 * Update order status (Admin function)
 */
export const updateOrderStatus = async (orderId, newStatus, note = '') => {
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
        throw new Error('Invalid order status');
    }

    const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note
    };

    // Update in Firestore
    if (isFirebaseConfigured() && db) {
        try {
            const docRef = doc(db, ORDERS_COLLECTION, orderId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const currentHistory = docSnap.data().statusHistory || [];

                await updateDoc(docRef, {
                    status: newStatus,
                    statusHistory: [...currentHistory, statusUpdate],
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error updating order in Firestore:', error);
        }
    }

    // Update locally
    try {
        const localOrders = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
        const orders = localOrders ? JSON.parse(localOrders) : [];
        const orderIndex = orders.findIndex(o => o.orderId === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].statusHistory = [
                ...(orders[orderIndex].statusHistory || []),
                statusUpdate
            ];
            orders[orderIndex].updatedAt = new Date().toISOString();

            await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
        }
    } catch (error) {
        console.error('Error updating local order:', error);
    }

    return { success: true, orderId, status: newStatus };
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, reason = '') => {
    // Only pending orders can be cancelled
    const { order } = await getOrderById(orderId);

    if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.CONFIRMED) {
        throw new Error('Only pending or confirmed orders can be cancelled');
    }

    return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, reason || 'Cancelled by customer');
};

/**
 * Get order tracking info
 */
export const getOrderTracking = async (orderId) => {
    const { order } = await getOrderById(orderId);

    const trackingSteps = [
        { key: 'pending', label: 'Order Placed', icon: 'receipt' },
        { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
        { key: 'processing', label: 'Processing', icon: 'cube' },
        { key: 'shipped', label: 'Shipped', icon: 'airplane' },
        { key: 'delivered', label: 'Delivered', icon: 'home' }
    ];

    const statusIndex = trackingSteps.findIndex(s => s.key === order.status);

    return {
        success: true,
        orderId,
        currentStatus: order.status,
        statusHistory: order.statusHistory || [],
        estimatedDelivery: calculateEstimatedDelivery(order),
        trackingSteps: trackingSteps.map((step, index) => ({
            ...step,
            completed: index <= statusIndex,
            current: index === statusIndex
        }))
    };
};

/**
 * Calculate estimated delivery date
 */
const calculateEstimatedDelivery = (order) => {
    const shippingDays = {
        standard: 7,
        express: 3,
        overnight: 1
    };

    const days = shippingDays[order.shippingMethod] || 7;
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + days);

    return deliveryDate.toISOString();
};

/**
 * Get ALL orders (Admin)
 */
export const getAllOrders = async () => {
    // Try Firestore first
    if (isFirebaseConfigured() && db) {
        try {
            const q = query(
                collection(db, ORDERS_COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(100) // Validate to prevent OOM on large datasets
            );
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, orders, source: 'firestore' };
        } catch (error) {
            console.error('Error fetching all orders:', error);
        }
    }

    // Fallback to local storage
    try {
        const localOrders = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
        const orders = localOrders ? JSON.parse(localOrders) : [];
        return { success: true, orders, source: 'local' };
    } catch (error) {
        return { success: true, orders: [], source: 'empty' };
    }
};

/**
 * Clear local orders (for testing)
 */
export const clearLocalOrders = async () => {
    try {
        await AsyncStorage.removeItem(LOCAL_ORDERS_KEY);
        return { success: true };
    } catch (error) {
        console.error('Error clearing local orders:', error);
        throw error;
    }
};

export default {
    ORDER_STATUS,
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    cancelOrder,
    getOrderTracking,
    getAllOrders, // Added
    clearLocalOrders
};
