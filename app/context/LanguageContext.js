/**
 * 🌐 Language Context - Kataraa
 * Manages Arabic/English translations
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Translation files
const translations = {
    ar: {
        // General
        appName: 'كتارا',
        search: 'ابحثي عن منتج...',
        viewAll: 'عرض الكل',
        loading: 'جاري التحميل...',

        // Navigation
        home: 'الرئيسية',
        products: 'المنتجات',
        cart: 'السلة',
        favorites: 'المفضلة',
        profile: 'حسابي',

        // Home Screen
        featuredCollections: 'مجموعات مميزة',
        newArrivals: 'وصل حديثاً',
        newArrivalsDesc: 'أحدث المنتجات الكورية',
        onSale: 'تخفيضات',
        onSaleDesc: 'خصومات حصرية',
        bestSellers: 'الأكثر مبيعاً',
        bestSellersDesc: 'المفضلة لدى عملائنا',
        discoverMore: 'اكتشفي المزيد',
        discoverMoreDesc: 'منتجات مختارة لك',
        shopNow: 'تسوقي الآن',

        // Skin Types
        shopBySkin: 'تسوقي حسب بشرتك',
        oilySkin: 'البشرة الدهنية',
        drySkin: 'البشرة الجافة',
        mixedSkin: 'البشرة المختلطة',
        sensitiveSkin: 'البشرة الحساسة',

        // Categories
        shopByCategory: 'تسوقي حسب التصنيف',
        acne: 'حب الشباب',
        makeup: 'المكياج',
        hairCare: 'العناية بالشعر',
        bodyCare: 'العناية بالجسم',
        serum: 'السيروم',
        suncare: 'واقي الشمس',

        // Product Card
        addToCart: 'أضف للسلة',
        soldOut: 'نفذت الكمية',
        sale: 'خصم',

        // Cart
        myCart: 'سلتي',
        cartEmpty: 'سلتك فارغة',
        cartEmptyDesc: 'ابدئي التسوق الآن!',
        startShopping: 'ابدئي التسوق',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        freeShipping: 'شحن مجاني',
        total: 'الإجمالي',
        checkout: 'إتمام الطلب',

        // Checkout
        shippingAddress: 'عنوان التوصيل',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        governorate: 'المحافظة',
        selectGovernorate: 'اختر المحافظة',
        city: 'المنطقة',
        selectCity: 'اختر المنطقة',
        block: 'القطعة',
        street: 'الشارع',
        notes: 'ملاحظات',
        continueToPayment: 'متابعة للدفع',

        // Payment
        paymentMethod: 'طريقة الدفع',
        cashOnDelivery: 'الدفع عند الاستلام',
        knet: 'كي نت',
        creditCard: 'بطاقة ائتمان',
        placeOrder: 'تأكيد الطلب',
        processing: 'جاري المعالجة...',

        // Order Success
        orderSuccess: 'تم الطلب بنجاح!',
        orderNumber: 'رقم الطلب',
        thankYou: 'شكراً لتسوقك معنا',
        backToHome: 'العودة للرئيسية',

        // Profile
        myOrders: 'طلباتي',
        settings: 'الإعدادات',
        language: 'اللغة',
        logout: 'تسجيل الخروج',

        // Why Shop With Us
        whyShopWithUs: 'لماذا تتسوقين معنا؟',
        guaranteedProducts: 'منتجات مضمونة',
        original100: '100% أصلية',
        wideVariety: 'تنوع واسع',
        products500: '+500 منتج',
        experience: 'خبرة طويلة',
        since2019: 'منذ 2019',
        fastDelivery: 'توصيل سريع',
        hours48: '24-48 ساعة',

        // Newsletter
        joinFamily: 'انضمي لعائلة كتارا',
        discount10: 'احصلي على خصم 10% على أول طلب!',
        subscribeNow: 'اشتركي الآن',

        // Flash Sale
        flashSale: 'تخفيضات حصرية!',
        upTo50: 'خصم يصل لـ 50%',

        // Admin
        dashboard: 'لوحة التحكم',
        analytics: 'التحليلات',
        customers: 'العملاء',
        orders: 'الطلبات',
        totalSales: 'إجمالي المبيعات',
        newCustomers: 'عملاء جدد',

        // Search
        searchResults: 'نتائج البحث',
        noResults: 'لا توجد نتائج',
    },

    en: {
        // General
        appName: 'KATARAA',
        search: 'Search for products...',
        viewAll: 'View All',
        loading: 'Loading...',

        // Navigation
        home: 'Home',
        products: 'Products',
        cart: 'Cart',
        favorites: 'Favorites',
        profile: 'Profile',

        // Home Screen
        featuredCollections: 'Featured Collections',
        newArrivals: 'New Arrivals',
        newArrivalsDesc: 'Latest K-Beauty products',
        onSale: 'On Sale',
        onSaleDesc: 'Exclusive discounts',
        bestSellers: 'Best Sellers',
        bestSellersDesc: 'Customer favorites',
        discoverMore: 'Discover More',
        discoverMoreDesc: 'Selected for you',
        shopNow: 'Shop Now',

        // Skin Types
        shopBySkin: 'Shop by Skin Type',
        oilySkin: 'Oily Skin',
        drySkin: 'Dry Skin',
        mixedSkin: 'Combination',
        sensitiveSkin: 'Sensitive',

        // Categories
        shopByCategory: 'Shop by Category',
        acne: 'Acne',
        makeup: 'Makeup',
        hairCare: 'Hair Care',
        bodyCare: 'Body Care',
        serum: 'Serums',
        suncare: 'Suncare',

        // Product Card
        addToCart: 'Add to Cart',
        soldOut: 'Sold Out',
        sale: 'Sale',

        // Cart
        myCart: 'My Cart',
        cartEmpty: 'Your cart is empty',
        cartEmptyDesc: 'Start shopping now!',
        startShopping: 'Start Shopping',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        freeShipping: 'Free Shipping',
        total: 'Total',
        checkout: 'Checkout',

        // Checkout
        shippingAddress: 'Shipping Address',
        fullName: 'Full Name',
        phone: 'Phone Number',
        governorate: 'Governorate',
        selectGovernorate: 'Select Governorate',
        city: 'Area',
        selectCity: 'Select Area',
        block: 'Block',
        street: 'Street',
        notes: 'Notes',
        continueToPayment: 'Continue to Payment',

        // Payment
        paymentMethod: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        knet: 'KNET',
        creditCard: 'Credit Card',
        placeOrder: 'Place Order',
        processing: 'Processing...',

        // Order Success
        orderSuccess: 'Order Successful!',
        orderNumber: 'Order Number',
        thankYou: 'Thank you for shopping with us',
        backToHome: 'Back to Home',

        // Profile
        myOrders: 'My Orders',
        settings: 'Settings',
        language: 'Language',
        logout: 'Logout',

        // Why Shop With Us
        whyShopWithUs: 'Why Shop With Us?',
        guaranteedProducts: 'Guaranteed',
        original100: '100% Original',
        wideVariety: 'Wide Variety',
        products500: '500+ Products',
        experience: 'Experience',
        since2019: 'Since 2019',
        fastDelivery: 'Fast Delivery',
        hours48: '24-48 Hours',

        // Newsletter
        joinFamily: 'Join Kataraa Family',
        discount10: 'Get 10% off your first order!',
        subscribeNow: 'Subscribe Now',

        // Flash Sale
        flashSale: 'Flash Sale!',
        upTo50: 'Up to 50% off',

        // Admin
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        customers: 'Customers',
        orders: 'Orders',
        totalSales: 'Total Sales',
        newCustomers: 'New Customers',

        // Search
        searchResults: 'Search Results',
        noResults: 'No results found',
    },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('ar'); // Default Arabic
    const [isRTL, setIsRTL] = useState(true);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('app_language');
            if (savedLanguage) {
                setLanguage(savedLanguage);
                setIsRTL(savedLanguage === 'ar');
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const changeLanguage = async (lang) => {
        try {
            await AsyncStorage.setItem('app_language', lang);
            setLanguage(lang);
            setIsRTL(lang === 'ar');

            // Note: Full RTL switch requires app restart
            // I18nManager.forceRTL(lang === 'ar');
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const t = (key) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        changeLanguage(newLang);
    };

    return (
        <LanguageContext.Provider value={{
            language,
            isRTL,
            t,
            changeLanguage,
            toggleLanguage,
            isArabic: language === 'ar',
            isEnglish: language === 'en',
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export default LanguageContext;
