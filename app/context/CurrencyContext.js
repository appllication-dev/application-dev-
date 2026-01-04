/**
 * 💰 Currency Context - Kataraa
 * Auto-detect country and show prices in local currency
 * Checkout always in KWD (WooCommerce base currency)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Currency configurations
const CURRENCIES = {
    KWD: {
        code: 'KWD',
        symbol: 'د.ك',
        name: 'دينار كويتي',
        nameEn: 'Kuwaiti Dinar',
        flag: '🇰🇼',
        rate: 1, // Base currency
        decimals: 3,
    },
    BHD: {
        code: 'BHD',
        symbol: 'د.ب',
        name: 'دينار بحريني',
        nameEn: 'Bahraini Dinar',
        flag: '🇧🇭',
        rate: 1.03, // 1 KWD = 1.03 BHD (approximate)
        decimals: 3,
    },
    SAR: {
        code: 'SAR',
        symbol: 'ر.س',
        name: 'ريال سعودي',
        nameEn: 'Saudi Riyal',
        flag: '🇸🇦',
        rate: 12.2, // 1 KWD = 12.2 SAR (approximate)
        decimals: 2,
    },
    AED: {
        code: 'AED',
        symbol: 'د.إ',
        name: 'درهم إماراتي',
        nameEn: 'UAE Dirham',
        flag: '🇦🇪',
        rate: 11.95, // 1 KWD = 11.95 AED (approximate)
        decimals: 2,
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'دولار أمريكي',
        nameEn: 'US Dollar',
        flag: '🇺🇸',
        rate: 3.25, // 1 KWD = 3.25 USD (approximate)
        decimals: 2,
    },
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState('KWD');
    const [currencyInfo, setCurrencyInfo] = useState(CURRENCIES.KWD);

    useEffect(() => {
        loadCurrency();
    }, []);

    const loadCurrency = async () => {
        try {
            const savedCurrency = await AsyncStorage.getItem('app_currency');
            if (savedCurrency && CURRENCIES[savedCurrency]) {
                setCurrency(savedCurrency);
                setCurrencyInfo(CURRENCIES[savedCurrency]);
            } else {
                // Auto-detect could be added here with IP geolocation
                // For now, default to KWD
            }
        } catch (error) {
            console.error('Error loading currency:', error);
        }
    };

    const changeCurrency = async (code) => {
        if (CURRENCIES[code]) {
            try {
                await AsyncStorage.setItem('app_currency', code);
                setCurrency(code);
                setCurrencyInfo(CURRENCIES[code]);
            } catch (error) {
                console.error('Error saving currency:', error);
            }
        }
    };

    /**
     * Convert price from KWD to selected currency
     * @param {number|string} priceInKWD - Price in KWD (from WooCommerce)
     * @returns {string} Formatted price in selected currency
     */
    const formatPrice = (priceInKWD) => {
        const price = parseFloat(priceInKWD) || 0;
        const converted = price * currencyInfo.rate;
        return `${converted.toFixed(currencyInfo.decimals)} ${currencyInfo.symbol}`;
    };

    /**
     * Format price with code (e.g., "5.000 KWD")
     */
    const formatPriceWithCode = (priceInKWD) => {
        const price = parseFloat(priceInKWD) || 0;
        const converted = price * currencyInfo.rate;
        return `${converted.toFixed(currencyInfo.decimals)} ${currencyInfo.code}`;
    };

    /**
     * Get original price in KWD (for checkout)
     */
    const getKWDPrice = (priceInKWD) => {
        const price = parseFloat(priceInKWD) || 0;
        return `${price.toFixed(3)} KWD`;
    };

    /**
     * Convert back to KWD for checkout
     */
    const toKWD = (priceInSelectedCurrency) => {
        const price = parseFloat(priceInSelectedCurrency) || 0;
        return price / currencyInfo.rate;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            currencyInfo,
            currencies: CURRENCIES,
            changeCurrency,
            formatPrice,
            formatPriceWithCode,
            getKWDPrice,
            toKWD,
            isKWD: currency === 'KWD',
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
};

// Export currencies for settings screen
export const AVAILABLE_CURRENCIES = CURRENCIES;

export default CurrencyContext;
