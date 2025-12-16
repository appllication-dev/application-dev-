/**
 * Translation strings for Arabic and English
 * Usage: import { translations } from 'src/i18n/translations';
 */

export const translations = {
    en: {
        // ============================================
        // 🏠 Navigation & Tab Bar
        // ============================================
        home: 'Home',
        basket: 'Basket',
        favorites: 'Favorites',
        profile: 'Profile',

        // ============================================
        // 🏪 Home Screen
        // ============================================
        shopName: 'FUNNY SHOP',
        newArrival: 'New Arrival',
        seeAll: 'See all',
        searchProducts: 'Search products...',
        popularSearches: 'Popular Searches',
        foundResults: 'Found {count} results',
        onAnyAmount: 'On Any Amount',
        viewIntro: 'View Intro',
        cancel: 'Cancel',
        off: 'OFF',

        // ============================================
        // 📂 Categories
        // ============================================
        all: 'All',
        discount: 'Discount',
        tshirt: 'T-shirt',
        hoodie: 'Hoodie',
        hat: 'Hat',
        mockProductDescription: 'A creatively styled unisex hoodie by BOSS. This hooded sweatshirt is cut to a straight fit in French terry with a drawstring hood.',
        stock: 'Stock',
        mockReview1: 'Amazing quality! Fits perfectly.',
        mockReview2: 'Love the color, but shipping was a bit slow.',
        daysAgo: '{count} days ago',
        weeksAgo: '{count} weeks ago',
        weekAgo: '{count} week ago',

        // ============================================
        // 🛍️ Product
        // ============================================
        addToCart: 'Add to Cart',
        addedToCart: 'Added to Cart',
        outOfStock: 'Out of Stock',
        inStock: 'In Stock',
        price: 'Price',
        quantity: 'Quantity',
        size: 'Size',
        color: 'Color',
        description: 'Description',
        reviews: 'Reviews',
        writeReview: 'Write a Review',
        noReviewsYet: 'No reviews yet. Be the first to review!',
        writeYourReview: 'Write your review here...',
        loginRequired: 'Login Required',
        pleaseLoginToReview: 'Please login to leave a review.',
        pleaseEnterComment: 'Please enter a comment.',
        reviewAdded: 'Review added successfully!',
        failedToAddReview: 'Failed to add review. Please try again.',
        reviewFailed: 'Failed to add review.',

        // ============================================
        // 🛒 Basket / Cart
        // ============================================
        yourCart: 'Your Cart',
        cartEmpty: 'Your cart is empty',
        cartEmptyDesc: 'Looks like you haven\'t added anything yet',
        startShopping: 'Start Shopping',
        total: 'Total',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        freeShipping: 'Free Shipping',
        checkout: 'Checkout',
        remove: 'Remove',
        clearCart: 'Clear Cart',
        items: 'items',

        // ============================================
        // ❤️ Favorites / Saved
        // ============================================
        savedItems: 'Saved Items',
        noSavedItems: 'No saved items yet',
        noSavedDesc: 'Items you save will appear here',
        browsProducts: 'Browse Products',
        removeFromFavorites: 'Remove from Favorites',

        // ============================================
        // 👤 Profile & Settings
        // ============================================
        settings: 'Settings',
        language: 'Language',
        arabic: 'Arabic',
        english: 'English',
        notifications: 'Notifications',
        sounds: 'Sounds',
        vibration: 'Vibration',
        darkMode: 'Dark Mode',
        theme: 'Theme',
        account: 'Account',
        editProfile: 'Edit Profile',
        changePassword: 'Change Password',
        addresses: 'Addresses',
        paymentMethods: 'Payment Methods',
        orders: 'Orders',
        myFavorites: 'My Favorites',
        noFavorites: 'No favorites yet',
        orderHistory: 'Order History',
        helpSupport: 'Help & Support',
        support: 'Support & Info',
        customerService: 'Customer Service',
        faq: 'FAQ',
        rateApp: 'Rate App',
        inviteFriends: 'Invite Friends',
        privacyPolicy: 'Privacy Policy',
        termsConditions: 'Terms & Conditions',
        aboutUs: 'About Us',

        // ============================================
        // 🔐 Authentication
        // ============================================
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        createAccount: 'Create Account',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        fullName: 'Full Name',
        phone: 'Phone',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: 'Don\'t have an account?',
        loginSuccess: 'Login Successful',
        logoutConfirm: 'Are you sure you want to logout?',

        // ============================================
        // 📦 Checkout
        // ============================================
        shippingAddress: 'Shipping Address',
        paymentMethod: 'Payment Method',
        reviewOrder: 'Review Order',
        placeOrder: 'Place Order',
        orderPlaced: 'Order Confirmed!',
        orderSuccess: 'Thank you for your purchase!',
        continuePayment: 'Continue to Payment',
        backToHome: 'Back to Home',
        orderNumber: 'Order Number',
        totalAmount: 'Total Amount',
        estimatedDelivery: 'Estimated Delivery',
        businessDays: '3-5 Business Days',
        emailConfirmation: 'Email Confirmation',
        sentToEmail: 'Sent to your email',
        trackedDelivery: 'Tracked delivery',
        buyerProtection: 'Buyer Protection',
        thirtyDayGuarantee: '30-day guarantee',
        trackOrder: 'Track Order',
        continueShopping: 'Continue Shopping',
        processing: 'Processing...',
        edit: 'Edit',
        selectPaymentMethod: 'Select Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        payOnDelivery: 'Pay when you receive',
        creditCard: 'Credit / Debit Card',
        paySecurely: 'Pay securely now',
        yourName: 'YOUR NAME',
        saveCard: 'Save card for future purchases',
        paymentSecure: 'Your payment info is secure and encrypted',
        continueToReview: 'Continue to Review',
        expiryRequired: 'Expiry date is required',
        invalidExpiry: 'Invalid expiry date',
        invalidCvv: 'Invalid CVV',
        invalidName: 'Invalid name',
        enterPromoCode: 'Enter promo code',
        apply: 'Apply',
        applying: 'Applying...',
        promoApplied: 'Promo Applied',
        tryCodes: '💡 Try these codes:',
        invalidCode: 'Invalid Code',
        discountApplied: 'discount applied!',
        applePay: 'Apple Pay',
        googlePay: 'Google Pay',
        fastSecureCheckout: 'Fast and secure checkout',
        cardHolderLabel: 'CARDHOLDER',
        expiresLabel: 'EXPIRES',
        creditCardLabel: 'CREDIT CARD',

        // ============================================
        // 📍 Address
        // ============================================
        addAddress: 'Add Address',
        editAddress: 'Edit Address',
        deleteAddress: 'Delete Address',
        setDefault: 'Set as Default',
        default: 'Default',
        street: 'Street',
        city: 'City',
        country: 'Country',
        zipCode: 'Zip Code',

        // ============================================
        // 💳 Payment
        // ============================================
        addCard: 'Add Card',
        cardNumber: 'Card Number',
        expiryDate: 'Expiry Date',
        cvv: 'CVV',
        cardHolder: 'Card Holder Name',

        // ============================================
        // 🔔 Notifications
        // ============================================
        notificationsTitle: 'Notifications',
        noNotifications: 'No notifications yet',
        noNotifications: 'No notifications yet',
        markAllRead: 'Mark all as read',
        orderShippedTitle: 'Order Shipped!',
        orderShippedMsg: 'Your order #ORD-9823 has been shipped and is on its way.',
        newArrivalTitle: 'New Arrival Alert',
        newArrivalMsg: 'Check out the new Summer Collection now available in store.',
        flashSaleTitle: 'Flash Sale! ⚡',
        flashSaleMsg: 'Get 50% off on all hoodies for the next 24 hours.',
        accountSecurityTitle: 'Account Security',
        accountSecurityMsg: 'Your password was successfully updated.',
        hoursAgo: '{count} hours ago',
        dayAgo: '{count} day ago',
        enterNewAddress: 'Enter New Address',
        savedAddressesTitle: 'Saved Addresses',
        fullNameLabel: 'Full Name',
        phoneNumberLabel: 'Phone Number',
        inputErrorAddress: 'Please enter a valid address',
        inputErrorCity: 'City is required',
        inputErrorZip: 'Invalid zip code',
        securityWarning: 'Security Warning',
        invalidInput: 'Invalid characters detected in your input.',

        // ============================================
        // ⚠️ Errors & Alerts
        // ============================================
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        confirm: 'Confirm',
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        retry: 'Retry',
        loading: 'Loading...',
        noResults: 'No results found',
        somethingWrong: 'Something went wrong',
        tryAgain: 'Please try again',
        clearAll: 'Clear All',
        selectionRequired: 'Selection Required',
        selectSizeAndColor: 'Please choose a size and a color to proceed.',
        tooManyAttempts: 'Too Many Attempts',
        pleaseWait: 'Please wait {seconds} seconds before trying again.',
        orderFailed: 'Order Failed',
        orderFailedMsg: 'Failed to create order. Please try again.',
        paymentError: 'Payment Error',
        paymentErrorMsg: 'There was an issue processing your payment. Please try again.',
        connectionError: 'Connection Error',
        connectionErrorMsg: 'Please check your internet connection and try again.',
        unexpectedError: 'An unexpected error occurred. Please try again.',
        failedToProcess: 'Failed to process payment method. Please try again.',
        selectCountry: 'Select Country',
        selectCity: 'Select City',
        selectCountryFirst: 'Please select a country first',

        // ============================================
        // 🛠️ Admin & Dashboard
        // ============================================
        adminDashboard: 'Manager Dashboard',
        adminMode: 'Manager Mode',
        addNew: 'Add New',
        products: 'Products',
        ordersTitle: 'Orders', // Distinct from 'orders' navigation label to be safe
        searchPlaceholder: 'Search products...',
        noMatchingProducts: 'No matching products',
        noProductsFound: 'No products found',
        noOrdersYet: 'No orders yet',
        deleteProduct: 'Delete Product',
        deleteConfirm: 'Are you sure you want to delete "{title}"?',
        delete: 'Delete',
        deleteFailed: 'Failed to delete product',
        stock: 'Stock',
        syncData: 'Sync Data',
        syncDataConfirm: 'Upload all local products to the shared database? This makes them visible to everyone.',
        sync: 'Sync',
        liveActivity: 'Sales Mapping',
        salesByCountry: 'Sales by Country',
        overview: 'Overview',
        totalRevenue: 'Total Revenue',
        avgOrder: 'Average Order',
        addProduct: 'Add Product',
        viewOrders: 'View Orders',

        // ============================================
        // 🏷️ Additional UI Elements
        // ============================================
        quickActions: 'Quick Actions',
        recentPurchases: 'Recent Purchases',
        securePayment: 'Secure Payment',
        easyReturns: 'Easy Returns',
        helpCenter: 'Help Center',
        contactUs: 'Contact Us',
        socialMedia: 'Social Media',
        appGuide: 'App Guide',
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        emailSupport: 'Email Support',
        version: 'Version',
        tax: 'Tax',
        fashionAndStyle: 'Fashion & Style',
        seeAllReviews: 'See All',
        showLess: 'Show Less',
        clearReviews: 'Clear Reviews',
        clearReviewsConfirm: 'Are you sure you want to delete all reviews?',

        // ============================================
        // 📱 Onboarding
        // ============================================
        skip: 'Skip',
        next: 'Next',
        getStarted: 'Get Started',
        welcome: 'Welcome',
        onboardingTitle1: 'Discover Latest Fashion',
        onboardingDesc1: 'Explore our wide range of trendy clothes and accessories',
        onboardingTitle2: 'Easy Shopping',
        onboardingDesc2: 'Simple and secure shopping experience at your fingertips',
        onboardingTitle3: 'Fast Delivery',
        onboardingDesc3: 'Get your orders delivered quickly to your doorstep',

        // Profile Extra
        noPurchaseHistory: 'No Purchase History!',
        noItemsPurchased: 'No {category} items purchased',
        browseCollection: 'Browse our latest fashion collection and make your first purchase',
        exploreCollection: 'Explore Collection',
        deleteReview: 'Delete Review',
        confirmDeleteReview: 'Are you sure you want to delete this review?',
        reviewDeleted: 'Review deleted successfully',
    },

    ar: {
        // ============================================
        // 🛠️ Admin & Dashboard
        // ============================================
        adminDashboard: 'لوحة التحكم',
        adminMode: 'وضع المدير',
        addNew: 'إضافة جديد',
        products: 'المنتجات',
        ordersTitle: 'الطلبات',
        searchPlaceholder: 'ابحث عن المنتجات...',
        noMatchingProducts: 'لا توجد منتجات مطابقة',
        noProductsFound: 'لم يتم العثور على منتجات',
        noOrdersYet: 'لا توجد طلبات حتى الآن',
        deleteProduct: 'حذف المنتج',
        deleteConfirm: 'هل أنت متأكد من حذف "{title}"؟',
        delete: 'حذف',
        deleteFailed: 'فشل حذف المنتج',
        stock: 'المخزون',
        syncData: 'مزامنة البيانات',
        syncDataConfirm: 'رفع جميع المنتجات المحلية إلى قاعدة البيانات المشتركة؟ سيجعلها هذا مرئية للجميع.',
        sync: 'مزامنة',
        liveActivity: 'خريطة المبيعات',
        salesByCountry: 'المبيعات حسب الدولة',
        overview: 'نظرة عامة',
        totalRevenue: 'إجمالي الإيرادات',
        avgOrder: 'متوسط الطلب',
        addProduct: 'إضافة منتج',
        viewOrders: 'عرض الطلبات',

        // ============================================
        // 🏷️ Additional UI Elements
        // ============================================
        quickActions: 'إجراءات سريعة',
        recentPurchases: 'المشتريات الأخيرة',
        securePayment: 'دفع آمن',
        easyReturns: 'إرجاع سهل',
        easyReturns: 'إرجاع سهل',
        helpCenter: 'مركز المساعدة',
        contactUs: 'اتصل بنا',
        socialMedia: 'تواصل معنا',
        appGuide: 'دليل التطبيق',
        whatsapp: 'واتساب',
        instagram: 'انستغرام',
        emailSupport: 'الدعم عبر البريد',
        version: 'الإصدار',
        tax: 'الضريبة',
        fashionAndStyle: 'أزياء وأناقة',
        seeAllReviews: 'عرض الكل',
        showLess: 'عرض أقل',
        clearReviews: 'مسح التقييمات',
        clearReviewsConfirm: 'هل أنت متأكد من حذف جميع التقييمات؟',

        // ============================================
        // 📱 Onboarding
        // ============================================
        skip: 'تخطي',
        next: 'التالي',
        getStarted: 'ابدأ الآن',
        welcome: 'مرحباً',
        onboardingTitle1: 'اكتشف أحدث الموضة',
        onboardingDesc1: 'استكشف مجموعتنا الواسعة من الملابس والإكسسوارات العصرية',
        onboardingTitle2: 'تسوق سهل',
        onboardingDesc2: 'تجربة تسوق بسيطة وآمنة في متناول يدك',
        onboardingTitle3: 'توصيل سريع',
        onboardingDesc3: 'احصل على طلباتك بسرعة إلى باب منزلك',

        home: 'الرئيسية',
        basket: 'السلة',
        favorites: 'المفضلة',
        profile: 'حسابي',

        // ============================================
        // 🏪 Home Screen
        // ============================================
        shopName: 'متجر فاني',
        newArrival: 'وصل حديثاً',
        seeAll: 'عرض الكل',
        searchProducts: 'ابحث عن منتجات...',
        popularSearches: 'عمليات البحث الشائعة',
        foundResults: 'تم العثور على {count} نتيجة',
        onAnyAmount: 'على أي مبلغ',
        viewIntro: 'عرض المقدمة',
        cancel: 'إلغاء',
        off: 'خصم',

        // ============================================
        // 📂 Categories
        // ============================================
        all: 'الكل',
        discount: 'تخفيضات',
        tshirt: 'تيشيرت',
        hoodie: 'هودي',
        hat: 'قبعة',
        mockProductDescription: 'هودي بتصميم مبتكر للجنسين من بوس. هذه السترة ذات القبعة تأتي بقصة مستقيمة من قماش فرينش تيري مع غطاء رأس برباط.',
        stock: 'المخزون',
        mockReview1: 'جودة مذهلة! المقاس مثالي.',
        mockReview2: 'أحببت اللون، لكن الشحن كان بطيئاً قليلاً.',
        daysAgo: 'منذ {count} أيام',
        weeksAgo: 'منذ {count} أسابيع',
        weekAgo: 'منذ أسبوع',

        // ============================================
        // 🛍️ Product
        // ============================================
        addToCart: 'أضف للسلة',
        addedToCart: 'تمت الإضافة للسلة',
        outOfStock: 'نفذت الكمية',
        inStock: 'متوفر',
        price: 'السعر',
        quantity: 'الكمية',
        size: 'المقاس',
        color: 'اللون',
        description: 'الوصف',
        reviews: 'التقييمات',
        writeReview: 'اكتب تقييم',
        noReviewsYet: 'لا توجد تقييمات بعد. كن أول من يقيم!',
        writeYourReview: 'اكتب تقييمك هنا...',
        loginRequired: 'تسجيل الدخول مطلوب',
        pleaseLoginToReview: 'الرجاء تسجيل الدخول لترك تقييم.',
        pleaseEnterComment: 'الرجاء إدخال تعليق.',
        reviewAdded: 'تم إضافة التقييم بنجاح!',
        failedToAddReview: 'فشل إضافة التقييم. حاول مرة أخرى.',
        reviewFailed: 'فشل إضافة التقييم.',

        // ============================================
        // 🛒 Basket / Cart
        // ============================================
        yourCart: 'سلتك',
        cartEmpty: 'سلتك فارغة',
        cartEmptyDesc: 'يبدو أنك لم تضف شيئاً بعد',
        startShopping: 'ابدأ التسوق',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        freeShipping: 'شحن مجاني',
        checkout: 'إتمام الشراء',
        remove: 'إزالة',
        clearCart: 'إفراغ السلة',
        items: 'عناصر',

        // ============================================
        // ❤️ Favorites / Saved
        // ============================================
        savedItems: 'العناصر المحفوظة',
        noSavedItems: 'لا توجد عناصر محفوظة',
        noSavedDesc: 'العناصر التي تحفظها ستظهر هنا',
        browsProducts: 'تصفح المنتجات',
        removeFromFavorites: 'إزالة من المفضلة',

        // ============================================
        // 👤 Profile & Settings
        // ============================================
        settings: 'الإعدادات',
        language: 'اللغة',
        arabic: 'العربية',
        english: 'الإنجليزية',
        notifications: 'الإشعارات',
        sounds: 'الأصوات',
        vibration: 'الاهتزاز',
        darkMode: 'الوضع الداكن',
        theme: 'المظهر',
        account: 'الحساب',
        editProfile: 'تعديل الحساب',
        changePassword: 'تغيير كلمة المرور',
        addresses: 'العناوين',
        paymentMethods: 'طرق الدفع',
        orders: 'الطلبات',
        myFavorites: 'المفضلة',
        noFavorites: 'لا توجد عناصر مفضلة بعد',
        orderHistory: 'سجل الطلبات',
        helpSupport: 'المساعدة والدعم',
        support: 'الدعم والمعلومات',
        customerService: 'خدمة العملاء',
        faq: 'الأسئلة الشائعة',
        rateApp: 'قيّم التطبيق',
        inviteFriends: 'دعوة الأصدقاء',
        privacyPolicy: 'سياسة الخصوصية',
        termsConditions: 'الشروط والأحكام',
        aboutUs: 'من نحن',

        // ============================================
        // 🔐 Authentication
        // ============================================
        login: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        register: 'إنشاء حساب',
        createAccount: 'إنشاء حساب جديد',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        dontHaveAccount: 'ليس لديك حساب؟',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        logoutConfirm: 'هل أنت متأكد من تسجيل الخروج؟',

        // ============================================
        // 📦 Checkout
        // ============================================
        shippingAddress: 'عنوان الشحن',
        paymentMethod: 'طريقة الدفع',
        reviewOrder: 'مراجعة الطلب',
        placeOrder: 'تأكيد الطلب',
        orderPlaced: 'تم تأكيد الطلب!',
        orderSuccess: 'شكراً لشرائك!',
        continuePayment: 'المتابعة للدفع',
        backToHome: 'العودة للرئيسية',
        orderNumber: 'رقم الطلب',
        totalAmount: 'المبلغ الإجمالي',
        estimatedDelivery: 'موعد التوصيل المتوقع',
        businessDays: '3-5 أيام عمل',
        emailConfirmation: 'تأكيد بالبريد',
        sentToEmail: 'أُرسل لبريدك',
        trackedDelivery: 'توصيل متتبع',
        buyerProtection: 'حماية المشتري',
        thirtyDayGuarantee: 'ضمان 30 يوم',
        trackOrder: 'تتبع الطلب',
        continueShopping: 'متابعة التسوق',
        processing: 'جاري المعالجة...',
        edit: 'تعديل',
        selectPaymentMethod: 'اختر طريقة الدفع',
        cashOnDelivery: 'الدفع عند الاستلام',
        payOnDelivery: 'ادفع عند استلام طلبك',
        creditCard: 'بطاقة ائتمان / خصم',
        paySecurely: 'ادفع بأمان الآن',
        yourName: 'اسمك',
        saveCard: 'حفظ البطاقة للمشتريات القادمة',
        paymentSecure: 'بيانات الدفع آمنة ومشفرة',
        continueToReview: 'المتابعة للمراجعة',
        expiryRequired: 'تاريخ الانتهاء مطلوب',
        invalidExpiry: 'تاريخ غير صالح',
        invalidCvv: 'رمز التحقق غير صالح',
        invalidName: 'اسم غير صالح',
        enterPromoCode: 'أدخل كود الخصم',
        apply: 'تطبيق',
        applying: 'جاري التطبيق...',
        promoApplied: 'تم تطبيق الخصم',
        tryCodes: '💡 جرب هذه الأكواد:',
        invalidCode: 'كود غير صالح',
        discountApplied: 'خصم تم تطبيقه!',
        applePay: 'Apple Pay',
        googlePay: 'Google Pay',
        fastSecureCheckout: 'دفع سريع وآمن',
        cardHolderLabel: 'حامل البطاقة',
        expiresLabel: 'الانتهاء',
        creditCardLabel: 'بطاقة الائتمان',

        // ============================================
        // 📍 Address
        // ============================================
        addAddress: 'إضافة عنوان',
        editAddress: 'تعديل العنوان',
        deleteAddress: 'حذف العنوان',
        setDefault: 'تعيين كافتراضي',
        default: 'افتراضي',
        street: 'الشارع',
        city: 'المدينة',
        country: 'الدولة',
        zipCode: 'الرمز البريدي',

        // ============================================
        // 💳 Payment
        // ============================================
        addCard: 'إضافة بطاقة',
        cardNumber: 'رقم البطاقة',
        expiryDate: 'تاريخ الانتهاء',
        cvv: 'رمز الأمان',
        cardHolder: 'اسم حامل البطاقة',

        // ============================================
        // 🔔 Notifications
        // ============================================
        notificationsTitle: 'الإشعارات',
        noNotifications: 'لا توجد إشعارات',
        markAllRead: 'تحديد الكل كمقروء',
        orderShippedTitle: 'تم شحن الطلب!',
        orderShippedMsg: 'تم شحن طلبك #ORD-9823 وهو في الطريق إليك.',
        newArrivalTitle: 'تنبيه وصول جديد',
        newArrivalMsg: 'تفقد تشكيلة الصيف الجديدة المتوفرة الآن في المتجر.',
        flashSaleTitle: 'عرض خاطف! ⚡',
        flashSaleMsg: 'احصل على خصم 50% على جميع الهوديز لمدة 24 ساعة.',
        accountSecurityTitle: 'أمان الحساب',
        accountSecurityMsg: 'تم تحديث كلمة المرور بنجاح.',
        hoursAgo: 'منذ {count} ساعات',
        dayAgo: 'منذ يوم',
        enterNewAddress: 'أدخل عنوان جديد',
        savedAddressesTitle: 'العناوين المحفوظة',
        fullNameLabel: 'الاسم الكامل',
        phoneNumberLabel: 'رقم الهاتف',
        inputErrorAddress: 'يرجى إدخال عنوان صحيح',
        inputErrorCity: 'المدينة مطلوبة',
        inputErrorZip: 'الرمز البريدي غير صالح',
        securityWarning: 'تحذير أمني',
        invalidInput: 'تم اكتشاف أحرف غير صالحة في المدخلات.',

        // ============================================
        // ⚠️ Errors & Alerts
        // ============================================
        error: 'خطأ',
        success: 'نجاح',
        warning: 'تحذير',
        confirm: 'تأكيد',
        ok: 'موافق',
        yes: 'نعم',
        no: 'لا',
        retry: 'إعادة المحاولة',
        loading: 'جاري التحميل...',
        noResults: 'لا توجد نتائج',
        somethingWrong: 'حدث خطأ ما',
        tryAgain: 'يرجى المحاولة مرة أخرى',
        clearAll: 'مسح الكل',
        selectionRequired: 'الاختيار مطلوب',
        selectSizeAndColor: 'الرجاء اختيار المقاس واللون للمتابعة.',
        tooManyAttempts: 'محاولات كثيرة جداً',
        pleaseWait: 'يرجى الانتظار {seconds} ثواني قبل المحاولة مجدداً.',
        orderFailed: 'فشل الطلب',
        orderFailedMsg: 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.',
        paymentError: 'خطأ في الدفع',
        paymentErrorMsg: 'حدثت مشكلة أثناء معالجة الدفع. يرجى المحاولة.',
        connectionError: 'خطأ في الاتصال',
        connectionErrorMsg: 'تحقق من الاتصال بالإنترنت وحاول مجدداً.',
        unexpectedError: 'حدث خطأ غير متوقع. يرجى المحاولة.',
        failedToProcess: 'فشل معالجة طريقة الدفع. حاول مجدداً.',
        selectCountry: 'اختر الدولة',
        selectCity: 'اختر المدينة',
        selectCountryFirst: 'يرجى اختيار الدولة أولاً',

        // Profile Extra
        noPurchaseHistory: 'لا يوجد سجل مشتريات!',
        noItemsPurchased: 'لم يتم شراء عناصر {category}',
        browseCollection: 'تصفح أحدث تشكيلة أزياء وقم بأول عملية شراء لك',
        exploreCollection: 'استكشف التشكيلة',
        deleteReview: 'حذف التقييم',
        confirmDeleteReview: 'هل أنت متأكد من حذف هذا التقييم؟',
        reviewDeleted: 'تم حذف التقييم بنجاح',
    }
};

export default translations;
