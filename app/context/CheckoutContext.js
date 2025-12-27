import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const { user } = useAuth();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    governorate: '',
    city: '',
    block: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card
  const [shippingFee, setShippingFee] = useState(0);
  const [orders, setOrders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

  // Load data from Storage
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setOrders([]);
        setSavedAddresses([]);
        setSavedPaymentMethods([]);
        return;
      }

      const suffix = user.email.toLowerCase();
      try {
        const [storedOrders, storedAddresses, storedPayments] = await Promise.all([
          storage.getItem(`orders_${suffix}`),
          storage.getItem(`addresses_${suffix}`),
          storage.getItem(`payments_${suffix}`),
        ]);

        if (storedOrders) setOrders(storedOrders);
        if (storedAddresses) setSavedAddresses(storedAddresses);
        if (storedPayments) setSavedPaymentMethods(storedPayments);
      } catch (e) {
        console.error('Error loading checkout data:', e);
      }
    };

    loadSavedData();
  }, [user]);

  const updateShippingInfo = (info) => {
    setShippingInfo(prev => ({ ...prev, ...info }));
  };

  const resetCheckout = () => {
    setShippingInfo({
      fullName: '',
      phone: '',
      governorate: '',
      city: '',
      block: '',
      street: '',
      building: '',
      floor: '',
      apartment: '',
      notes: '',
    });
    setPaymentMethod('cod');
    setShippingFee(0);
  };

  const saveAddress = async (address) => {
    const newAddresses = [address, ...savedAddresses];
    setSavedAddresses(newAddresses);
    if (user) {
      await storage.setItem(`addresses_${user.email.toLowerCase()}`, newAddresses);
    }
  };

  const deleteAddress = async (id) => {
    const newAddresses = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(newAddresses);
    if (user) {
      await storage.setItem(`addresses_${user.email.toLowerCase()}`, newAddresses);
    }
  };

  const savePaymentMethod = async (method) => {
    const newMethods = [method, ...savedPaymentMethods];
    setSavedPaymentMethods(newMethods);
    if (user) {
      await storage.setItem(`payments_${user.email.toLowerCase()}`, newMethods);
    }
  };

  const deletePaymentMethod = async (id) => {
    const newMethods = savedPaymentMethods.filter(m => m.id !== id);
    setSavedPaymentMethods(newMethods);
    if (user) {
      await storage.setItem(`payments_${user.email.toLowerCase()}`, newMethods);
    }
  };

  const addOrder = async (order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    if (user) {
      await storage.setItem(`orders_${user.email.toLowerCase()}`, newOrders);
    }
  };

  return (
    <CheckoutContext.Provider value={{
      shippingInfo,
      setShippingInfo,
      updateShippingInfo,
      paymentMethod,
      setPaymentMethod,
      shippingFee,
      setShippingFee,
      resetCheckout,
      orders,
      addOrder,
      savedAddresses,
      saveAddress,
      deleteAddress,
      savedPaymentMethods,
      savePaymentMethod,
      deletePaymentMethod
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
