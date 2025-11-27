import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckoutContext = createContext();

const STORAGE_KEYS = {
    ADDRESSES: '@saved_addresses',
    PAYMENT_METHODS: '@saved_payment_methods',
    ORDERS: '@order_history',
};

export const CheckoutProvider = ({ children }) => {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
    const [currentShippingAddress, setCurrentShippingAddress] = useState(null);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [orders, setOrders] = useState([]);

    // Load saved data on mount
    useEffect(() => {
        loadSavedData();
    }, []);

    const loadSavedData = async () => {
        try {
            const addresses = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
            const payments = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
            const orderHistory = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);

            if (addresses) setSavedAddresses(JSON.parse(addresses));
            if (payments) setSavedPaymentMethods(JSON.parse(payments));
            if (orderHistory) setOrders(JSON.parse(orderHistory));
        } catch (error) {
            console.warn('Failed to load checkout data:', error);
        }
    };

    // Address Management
    const saveAddress = async (address) => {
        try {
            const newAddress = {
                id: Date.now().toString(),
                ...address,
                isDefault: savedAddresses.length === 0,
            };

            const updatedAddresses = [...savedAddresses, newAddress];
            setSavedAddresses(updatedAddresses);
            await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedAddresses));

            return newAddress;
        } catch (error) {
            console.warn('Failed to save address:', error);
        }
    };

    const deleteAddress = async (addressId) => {
        try {
            const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
            setSavedAddresses(updatedAddresses);
            await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedAddresses));
        } catch (error) {
            console.warn('Failed to delete address:', error);
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            const updatedAddresses = savedAddresses.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId,
            }));
            setSavedAddresses(updatedAddresses);
            await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedAddresses));
        } catch (error) {
            console.warn('Failed to set default address:', error);
        }
    };

    // Payment Method Management
    const savePaymentMethod = async (payment) => {
        try {
            const newPayment = {
                id: Date.now().toString(),
                ...payment,
                isDefault: savedPaymentMethods.length === 0,
            };

            const updatedPayments = [...savedPaymentMethods, newPayment];
            setSavedPaymentMethods(updatedPayments);
            await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(updatedPayments));

            return newPayment;
        } catch (error) {
            console.warn('Failed to save payment method:', error);
        }
    };

    const deletePaymentMethod = async (paymentId) => {
        try {
            const updatedPayments = savedPaymentMethods.filter(pm => pm.id !== paymentId);
            setSavedPaymentMethods(updatedPayments);
            await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(updatedPayments));
        } catch (error) {
            console.warn('Failed to delete payment method:', error);
        }
    };

    // Promo Code
    const applyPromoCode = (code) => {
        // Mock promo codes
        const promoCodes = {
            'SAVE10': 10,
            'SAVE20': 20,
            'WELCOME': 15,
            'FIRST': 25,
        };

        const discountPercent = promoCodes[code.toUpperCase()];

        if (discountPercent) {
            setPromoCode(code);
            setDiscount(discountPercent);
            return { success: true, discount: discountPercent };
        } else {
            return { success: false, message: 'Invalid promo code' };
        }
    };

    const removePromoCode = () => {
        setPromoCode('');
        setDiscount(0);
    };

    // Order Management
    const createOrder = async (orderData) => {
        try {
            const newOrder = {
                orderNumber: `ORD-${Date.now()}`,
                date: new Date().toISOString(),
                status: 'pending',
                ...orderData,
            };

            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);
            await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

            return newOrder;
        } catch (error) {
            console.warn('Failed to create order:', error);
        }
    };

    const resetCheckout = () => {
        setCurrentShippingAddress(null);
        setCurrentPaymentMethod(null);
        setPromoCode('');
        setDiscount(0);
    };

    const value = {
        // Addresses
        savedAddresses,
        currentShippingAddress,
        setCurrentShippingAddress,
        saveAddress,
        deleteAddress,
        setDefaultAddress,

        // Payment Methods
        savedPaymentMethods,
        currentPaymentMethod,
        setCurrentPaymentMethod,
        savePaymentMethod,
        deletePaymentMethod,

        // Promo Codes
        promoCode,
        discount,
        applyPromoCode,
        removePromoCode,

        // Orders
        orders,
        createOrder,
        resetCheckout,
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within CheckoutProvider');
    }
    return context;
};
