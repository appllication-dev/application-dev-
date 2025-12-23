/**
 * Checkout Context - Kataraa
 */

import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
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
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutContext;
