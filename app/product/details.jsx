import React from 'react';
import ProductsDeltScreen from '../components/ProductsDeltScreen';
import { Stack } from 'expo-router';

export default function ProductDetails() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ProductsDeltScreen />
        </>
    );
}
