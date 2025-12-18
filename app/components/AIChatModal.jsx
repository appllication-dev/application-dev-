import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';
import data from '../data/data'; // Import Local Data (Arabic)

// Use the same products as Home Screen
const APP_PRODUCTS = data.products;

// =====================================================
// 🤖 مساعد متجر الملابس العصري - AI Shopping Assistant
// =====================================================
// معلومات المتجر:
// - نبيع ملابس عصرية للرجال والنساء
// - تشكيلة متنوعة: قمصان، هوديز، جاكيتات، سراويل، أحذية...
// - خدمة توصيل سريعة
// - أسعار منافسة وجودة عالية
// =====================================================

const generateResponse = (text) => {
    const lowerText = text.toLowerCase();
    const arabicText = text;
    let responseText = "";
    let matchedProducts = [];

    // Helper to find products (Smart Search)
    const findProducts = (keywords) => {
        // Filter out common/stop words
        const stopWords = ['عندكم', 'باغي', 'بغيت', 'شي', 'واش', 'هل', 'في', 'من', 'على', 'the', 'a', 'an', 'is', 'are'];
        const filteredKeywords = keywords.filter(k => k.length > 2 && !stopWords.includes(k));

        return APP_PRODUCTS.filter(p => {
            const titleLower = p.title.toLowerCase();
            const titleArabic = p.title;
            const categoryLower = p.category.toLowerCase();
            const categoryArabic = p.category;

            return filteredKeywords.some(keyword => {
                const keywordLower = keyword.toLowerCase();
                return titleLower.includes(keywordLower) ||
                    titleArabic.includes(keyword) ||
                    categoryLower.includes(keywordLower) ||
                    categoryArabic.includes(keyword);
            });
        });
    };

    // Get available categories from products
    const getAvailableCategories = () => {
        const categories = [...new Set(APP_PRODUCTS.map(p => p.category))];
        return categories.join('، ');
    };

    // Random greeting responses for variety - مهذبة وراقية
    const greetingResponses = [
        "أهلاً وسهلاً بك سيدي/سيدتي في متجرنا الكريم! 👋 تشرفنا بزيارتك. كيف يمكنني خدمتك اليوم؟",
        "مرحباً بك! 🌟 نورت المتجر والله. تفضل، أنا في خدمتك. شنو اللي تبحث عنه؟",
        "أهلاً وسهلاً! ✨ يسعدني أن أكون في خدمتك. تفضل بطلب أي شيء وسأساعدك بكل سرور.",
        "وعليكم السلام ورحمة الله وبركاته! 😊 حياك الله وبياك! كيف أقدر أخدمك اليوم؟",
        "السلام عليكم! 🙏 أهلاً بك في متجرنا. شرفتنا، تفضل واطلب اللي تبي وأنا في الخدمة."
    ];

    // Random thanks responses - مهذبة
    const thanksResponses = [
        "العفو سيدي/سيدتي! 😊 هذا واجبنا. سعيد جداً إني قدرت أساعدك. في أي وقت تحتاج شي، أنا هنا!",
        "لا شكر على واجب! 💫 خدمتك شرف لنا. هل هناك شيء آخر أقدر أساعدك فيه؟",
        "تسلم/تسلمي! 🙏 المهم رضاك. إذا احتجت أي مساعدة أخرى، لا تتردد.",
        "بارك الله فيك! ✨ أتمنى لك تسوق ممتع. أنا دائماً في خدمتك!",
        "الله يعطيك العافية! 😊 إذا عندك أي استفسار آخر، تفضل اسأل براحتك."
    ];

    // Size questions - مهذبة
    const sizeResponses = [
        "تفضل سيدي/سيدتي، المقاسات المتوفرة عندنا هي: S, M, L, XL, XXL. 📏 لو سمحت، شنو مقاسك المفضل باش نوريك الأنسب؟",
        "بكل سرور! عندنا جميع المقاسات من S حتى XXL. تفضل قولي مقاسك وأنا أبحث لك عن أحسن القطع. ✨"
    ];

    // Delivery info - مهذبة
    const deliveryResponses = [
        "🚚 نعم بالتأكيد سيدي/سيدتي! نوفر خدمة توصيل سريعة وآمنة لجميع المدن. التوصيل عادة يكون خلال 2-3 أيام عمل إن شاء الله.",
        "أكيد! 📦 التوصيل متوفر والحمد لله. طلبك يوصلك بأمان في أقرب وقت. وإذا عندك أي استفسار عن الطلب، تواصل معنا."
    ];

    // Price questions - مهذبة
    const priceResponses = [
        "تفضل سيدي/سيدتي! 💰 أسعارنا منافسة جداً والحمد لله مع جودة عالية. شنو المنتج اللي تبي تعرف سعره؟",
        "بكل سرور! عندنا أسعار مناسبة للجميع إن شاء الله، ودائماً فيه عروض وتخفيضات. قولي شنو يهمك وأنا أفيدك. ✨"
    ];

    // Fashion advice - مهذبة
    const fashionAdvice = [
        "💡 إذا تسمح لي سيدي/سيدتي بنصيحة: الهودي الأسود قطعة أساسية تمشي مع كل شي! جربه مع جينز وسنيكرز للإطلالة العصرية.",
        "💡 نصيحة من القلب: الجاكيت مع تيشيرت بسيط وسروال جينز = إطلالة كاجوال أنيقة ومريحة.",
        "💡 لو سمحت، اسمحلي أقترح عليك: الأسود والأبيض دائماً اختيار موفق - سهل التنسيق ويعطي look راقي!"
    ];

    // =====================================================
    // 1. التحيات والترحيب
    // =====================================================
    if (lowerText.includes('salam') || lowerText.includes('marhaba') || lowerText.includes('ahlan') ||
        lowerText.includes('مرحبا') || lowerText.includes('hi') || lowerText.includes('hello') ||
        lowerText.includes('السلام') || lowerText.includes('صباح') || lowerText.includes('مساء') ||
        lowerText.includes('اهلا') || lowerText.includes('هلا') || lowerText.includes('سلام')) {
        return { text: greetingResponses[Math.floor(Math.random() * greetingResponses.length)], products: [] };
    }

    // =====================================================
    // 2. الشكر والأدب
    // =====================================================
    if (lowerText.includes('shukran') || lowerText.includes('thanks') || lowerText.includes('merci') ||
        lowerText.includes('شكرا') || lowerText.includes('شكراً') || lowerText.includes('مشكور') ||
        lowerText.includes('بارك') || lowerText.includes('الله يعطيك')) {
        return { text: thanksResponses[Math.floor(Math.random() * thanksResponses.length)], products: [] };
    }

    // =====================================================
    // 2.5 كيف حالك / لاباس
    // =====================================================
    if (lowerText.includes('كيف حالك') || lowerText.includes('كيفك') || lowerText.includes('شخبارك') ||
        lowerText.includes('لاباس') || lowerText.includes('كيف الحال') || lowerText.includes('how are you') ||
        lowerText.includes('اش خبارك') || lowerText.includes('عامل ايه') || lowerText.includes('ازيك')) {
        const howAreYouResponses = [
            "الحمد لله بخير، الله يسلمك! 😊 شكراً على سؤالك الكريم. كيف أقدر أخدمك اليوم؟",
            "تمام الحمد لله! 🙏 الله يحفظك. في خدمتك، تفضل اسأل عن أي شي تحتاجه.",
            "بخير والحمد لله، جزاك الله خير على السؤال! ✨ أنا هنا لمساعدتك، تفضل.",
            "الله يبارك فيك! أنا بخير 😊 وأنت إن شاء الله بخير؟ كيف أقدر أساعدك؟"
        ];
        return { text: howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)], products: [] };
    }

    // =====================================================
    // 2.6 من أنتم / من انت / تعريف
    // =====================================================
    if (lowerText.includes('من انت') || lowerText.includes('من أنت') || lowerText.includes('من انتم') ||
        lowerText.includes('من أنتم') || lowerText.includes('شكون انت') || lowerText.includes('who are you') ||
        lowerText.includes('عرفني') || lowerText.includes('عرف نفسك')) {
        const whoAmIResponses = [
            "أهلاً بك! 🤖 أنا المساعد الذكي لمتجر Funny Shop.\n\nمهمتي هي مساعدتك في:\n✨ البحث عن المنتجات\n📏 معرفة المقاسات والألوان\n🚚 معلومات التوصيل\n💡 نصائح الموضة والتنسيق\n\nتفضل، كيف أقدر أخدمك؟ 🙏",
            "تشرفت بك! 😊 أنا مساعدك الشخصي للتسوق في Funny Shop.\n\nأقدر أساعدك في:\n• البحث عن الملابس\n• معرفة الأسعار والمقاسات\n• تقديم نصائح التنسيق\n\nفي خدمتك! ✨"
        ];
        return { text: whoAmIResponses[Math.floor(Math.random() * whoAmIResponses.length)], products: [] };
    }

    // =====================================================
    // 2.7 فيما تساعدني / ماذا تفعل
    // =====================================================
    if (lowerText.includes('فيما') || lowerText.includes('ماذا تفعل') || lowerText.includes('شنو تقدر') ||
        lowerText.includes('كيف تساعدني') || lowerText.includes('help') || lowerText.includes('مساعدة') ||
        lowerText.includes('اش تقدر') || lowerText.includes('what can you do') || lowerText.includes('شنو تعرف')) {
        const helpResponses = [
            "يسعدني أساعدك سيدي/سيدتي! 🛍️\n\nأقدر أساعدك في:\n\n🔍 **البحث عن المنتجات**\nقولي مثلاً: \"عندكم هوديز؟\" أو \"أبي جاكيت\"\n\n📏 **المقاسات**\nاسألني عن المقاسات المتوفرة\n\n💰 **الأسعار**\nاستفسر عن أسعار أي منتج\n\n🚚 **التوصيل**\nمعلومات الشحن والتوصيل\n\n💡 **نصائح الموضة**\nاقتراحات تنسيق الملابس\n\nتفضل، اسألني عن أي شي! 🙏",
            "أهلاً بك! ✨ أنا هنا لخدمتك في:\n\n1️⃣ البحث عن الملابس والمنتجات\n2️⃣ معرفة المقاسات والألوان المتوفرة\n3️⃣ الاستفسار عن الأسعار\n4️⃣ معلومات التوصيل\n5️⃣ نصائح التنسيق والموضة\n\nجرب تسألني: \"عندكم جاكيتات؟\" 😊"
        ];
        return { text: helpResponses[Math.floor(Math.random() * helpResponses.length)], products: [] };
    }

    // =====================================================
    // 2.8 هل لديكم هذا المقاس في منتج معين
    // =====================================================
    if ((lowerText.includes('لديكم') || lowerText.includes('عندكم') || lowerText.includes('فيه')) &&
        (lowerText.includes('مقاس') || lowerText.includes('قياس') || lowerText.includes('size'))) {
        const sizeAvailabilityResponses = [
            "نعم سيدي/سيدتي! 📏\n\nجميع منتجاتنا متوفرة بالمقاسات:\n• S (صغير)\n• M (وسط)\n• L (كبير)\n• XL (كبير جداً)\n• XXL (كبير جداً جداً)\n\nتفضل قولي اسم المنتج والمقاس اللي تبيه وأنا أتأكد لك من التوفر! ✨",
            "بكل سرور! عندنا جميع المقاسات من S حتى XXL.\n\n📌 لو سمحت، قولي:\n1. اسم المنتج\n2. المقاس اللي تبيه\n\nوأنا أفيدك فوراً! 🙏"
        ];
        return { text: sizeAvailabilityResponses[Math.floor(Math.random() * sizeAvailabilityResponses.length)], products: [] };
    }

    // =====================================================
    // 3. أسئلة عن المقاسات
    // =====================================================
    if (lowerText.includes('مقاس') || lowerText.includes('size') || lowerText.includes('قياس') ||
        lowerText.includes('كبير') || lowerText.includes('صغير') || arabicText.includes('XL') ||
        lowerText.includes('taille')) {
        return { text: sizeResponses[Math.floor(Math.random() * sizeResponses.length)], products: [] };
    }

    // =====================================================
    // 4. أسئلة عن التوصيل
    // =====================================================
    if (lowerText.includes('توصيل') || lowerText.includes('delivery') || lowerText.includes('شحن') ||
        lowerText.includes('livraison') || lowerText.includes('يوصل') || lowerText.includes('تسليم')) {
        return { text: deliveryResponses[Math.floor(Math.random() * deliveryResponses.length)], products: [] };
    }

    // =====================================================
    // 5. أسئلة عن الأسعار
    // =====================================================
    if (lowerText.includes('سعر') || lowerText.includes('ثمن') || lowerText.includes('price') ||
        lowerText.includes('prix') || lowerText.includes('بشحال') || lowerText.includes('كم سعر')) {
        return { text: priceResponses[Math.floor(Math.random() * priceResponses.length)], products: [] };
    }

    // =====================================================
    // 6. طلب نصائح موضة
    // =====================================================
    if (lowerText.includes('نصيحة') || lowerText.includes('تنسيق') || lowerText.includes('موضة') ||
        lowerText.includes('style') || lowerText.includes('fashion') || lowerText.includes('اقتراح') ||
        lowerText.includes('شنو نلبس') || lowerText.includes('ماذا ألبس')) {
        const randomAdvice = fashionAdvice[Math.floor(Math.random() * fashionAdvice.length)];
        matchedProducts = APP_PRODUCTS.slice(0, 3);
        return { text: randomAdvice + "\n\nوهذه بعض الاقتراحات اللي ممكن تعجبك:", products: matchedProducts };
    }

    // =====================================================
    // 7. البحث عن منتوجات محددة
    // =====================================================

    // هوديز
    if (lowerText.includes('hoodie') || lowerText.includes('هودي') || lowerText.includes('hodie') ||
        lowerText.includes('سويت') || lowerText.includes('sweat')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.category === 'هودي' || p.title.includes('هودي') || p.title.includes('سويت'));
        if (matchedProducts.length > 0) {
            responseText = "تفضل سيدي/سيدتي! 🔥 الهوديز من أفضل القطع عندنا والأكثر طلباً. اخترت لك هذه التشكيلة المميزة:";
        }
    }
    // أحذية وسنيكرز
    else if (lowerText.includes('sneaker') || lowerText.includes('سنيكرز') || lowerText.includes('shoes') ||
        lowerText.includes('أحذية') || lowerText.includes('sabat') || lowerText.includes('صباط') ||
        lowerText.includes('حذاء') || lowerText.includes('basket')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.category === 'أحذية' || p.title.includes('حذاء') || p.title.includes('Sneaker') || p.title.includes('سنيكرز'));
        if (matchedProducts.length > 0) {
            responseText = "تفضل! 👟 اختيارك موفق. الأحذية عندنا تجمع بين الراحة والأناقة. إليك أفضل الموديلات:";
        }
    }
    // جاكيتات ومعاطف
    else if (lowerText.includes('jacket') || lowerText.includes('جاكيت') || lowerText.includes('coat') ||
        lowerText.includes('معطف') || lowerText.includes('veste') || lowerText.includes('جاكت')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.title.includes('جاكيت') || p.title.includes('معطف') || p.category.includes('جاكيت'));
        if (matchedProducts.length > 0) {
            responseText = "بكل سرور! 🧥 الجاكيتات عندنا تجمع بين الأناقة والدفء. تفضل شوف هذه الخيارات المميزة:";
        }
    }
    // جينز وسراويل
    else if (lowerText.includes('jeans') || lowerText.includes('جينز') || lowerText.includes('sarwal') ||
        lowerText.includes('سروال') || lowerText.includes('pantalon') || lowerText.includes('بنطلون')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.title.includes('جينز') || p.title.includes('سروال') || p.title.includes('بنطلون'));
        if (matchedProducts.length > 0) {
            responseText = "تفضل سيدي/سيدتي! 👖 سراويل الجينز عندنا مريحة وجودتها عالية. إليك التشكيلة:";
        }
    }
    // قبعات
    else if (lowerText.includes('hat') || lowerText.includes('قبعة') || lowerText.includes('cap') ||
        lowerText.includes('casquette') || lowerText.includes('طاقية')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.category === 'قبعة' || p.title.includes('قبعة') || p.title.includes('كاب'));
        if (matchedProducts.length > 0) {
            responseText = "بكل سرور! 🧢 القبعات تُكمّل أي إطلالة. تفضل شوف هذه الموديلات الأنيقة:";
        }
    }
    // كنزة صوفية
    else if (lowerText.includes('كنزة') || lowerText.includes('صوف') || lowerText.includes('pull') ||
        lowerText.includes('pullover') || lowerText.includes('sweater')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.title.includes('كنزة') || p.title.includes('صوف'));
        if (matchedProducts.length > 0) {
            responseText = "تفضل سيدي/سيدتي! 🧶 الكنزات الصوفية دافئة وأنيقة. إليك هذه التشكيلة الرائعة:";
        }
    }
    // سترة
    else if (lowerText.includes('سترة') || lowerText.includes('cardigan') || lowerText.includes('gilet')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.title.includes('سترة'));
        if (matchedProducts.length > 0) {
            responseText = "بكل سرور! ✨ السترات عندنا مريحة وعصرية. تفضل شوف هذه الخيارات:";
        }
    }
    // تيشيرت
    else if (lowerText.includes('tshirt') || lowerText.includes('تيشيرت') || lowerText.includes('قميص') ||
        lowerText.includes('shirt') || lowerText.includes('tricot') || lowerText.includes('t-shirt')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.title.includes('قميص') || p.title.includes('تيشيرت') || p.category === 'تيشيرت');
        if (matchedProducts.length > 0) {
            responseText = "تفضل سيدي/سيدتي! 👕 تشكيلة القمصان والتيشيرتات عندنا متنوعة وراقية. إليك الأفضل:";
        }
    }

    // =====================================================
    // 8. عروض وتخفيضات
    // =====================================================
    else if (lowerText.includes('sale') || lowerText.includes('takhfid') || lowerText.includes('تخفيض') ||
        lowerText.includes('offer') || lowerText.includes('عرض') || lowerText.includes('solde') ||
        lowerText.includes('promotion') || lowerText.includes('رخيص')) {
        matchedProducts = APP_PRODUCTS.filter(p => p.category === 'تخفيضات');
        if (matchedProducts.length > 0) {
            responseText = "🔥 عندنا تخفيضات حصرية! لا تفوت هاد الفرصة:";
        } else {
            matchedProducts = APP_PRODUCTS.slice(0, 3);
            responseText = "حالياً عندنا أسعار منافسة على كل المنتوجات! شوف هاد الاختيارات:";
        }
    }

    // =====================================================
    // 9. الأكثر مبيعاً / المميز
    // =====================================================
    else if (lowerText.includes('best') || lowerText.includes('top') || lowerText.includes('afdal') ||
        lowerText.includes('أفضل') || lowerText.includes('مميز') || lowerText.includes('populaire') ||
        lowerText.includes('الأكثر') || lowerText.includes('ترند') || lowerText.includes('trend')) {
        matchedProducts = APP_PRODUCTS.slice(0, 4);
        responseText = "تفضل سيدي/سيدتي! ⭐ هذه المنتجات الأكثر طلباً عند زبائننا الكرام:";
    }

    // =====================================================
    // 10. عرض كل المنتوجات
    // =====================================================
    else if (lowerText.includes('كل') || lowerText.includes('all') || lowerText.includes('tout') ||
        lowerText.includes('جميع') || lowerText.includes('المنتوجات') || lowerText.includes('عندكم')) {
        matchedProducts = APP_PRODUCTS.slice(0, 6);
        responseText = "تفضل سيدي/سيدتي! 🛍️ هذه بعض منتجاتنا المميزة. اختر اللي يعجبك وأنا في الخدمة:";
    }

    // =====================================================
    // 11. البحث العام (Fallback)
    // =====================================================
    else {
        // Try to extract keywords from user input
        const words = lowerText.split(' ');
        matchedProducts = findProducts(words);

        if (matchedProducts.length > 0) {
            responseText = `وجدت لك ${matchedProducts.length} منتوج(ات) ممكن تناسبك:`;
        }
    }

    // =====================================================
    // معالجة النتيجة النهائية
    // =====================================================
    if (matchedProducts.length === 0) {
        // Get available categories to show user what's available
        const availableCategories = getAvailableCategories();

        // Friendly & Polite "not found" responses with available categories
        const notFoundResponses = [
            `عذراً سيدي/سيدتي، للأسف هذا المنتج غير متوفر حالياً 🙏\n\n📦 لكن تفضل، التصنيفات المتاحة عندنا:\n${availableCategories}\n\nتفضل قولي شنو يهمك وأنا في الخدمة!`,
            `أعتذر منك، ما وجدت هذا المنتج في المخزون حالياً 😊\n\n✨ لكن عندنا تشكيلة رائعة:\n${availableCategories}\n\nهل تحب تشوف شي من هذي التصنيفات؟`,
            `للأسف الشديد، هذا المنتج مش متوفر دابا 🙏\n\n🛍️ لكن إن شاء الله تلقى اللي يعجبك من:\n${availableCategories}\n\nتفضل، أنا في خدمتك!`
        ];
        return { text: notFoundResponses[Math.floor(Math.random() * notFoundResponses.length)], products: [] };
    }

    return { text: responseText, products: matchedProducts };
};

const AIChatModal = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    // Initial Message
    const [messages, setMessages] = useState([
        { id: '1', text: "السلام عليكم ورحمة الله وبركاته! 👋\n\nأهلاً وسهلاً بك سيدي/سيدتي في متجرنا.\n\nيسعدني أن أكون في خدمتك. تفضل اسألني عن:\n\n✨ المنتجات (هودي، جاكيت، جينز...)\n📏 المقاسات والألوان\n🚚 التوصيل والأسعار\n💡 نصائح التنسيق والموضة\n\nكيف أقدر أخدمك اليوم؟ 🙏", sender: 'ai', products: [] }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user', products: [] };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const { text, products } = generateResponse(inputText);
            const aiMsg = { id: (Date.now() + 1).toString(), text: text, sender: 'ai', products: products };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 800);
    };

    const handleProductPress = (product) => {
        onClose(); // Close chat

        // IMPORTANT: Ensure the product object structure matches what Detail Screen expects.
        // Assuming /product/[id] route or navigation with object
        router.push({ pathname: "/product/details", params: { item: JSON.stringify(product) } });
        // NOTE: Previous implementation was router.push(`/product/${product.id}`). 
        // If Detail screen takes params via Context or URL, ensure consistency.
        // Let's stick to simple ID route if that's how app works, OR pass object if using Expo Router params.
        // Reverting to previous ID based route to be safe if dynamic route exists:
        // router.push(`/product/${product.id}`); 
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View>
                <Animated.View
                    entering={FadeInUp.duration(300)}
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                        {
                            backgroundColor: isUser ? RevolutionTheme.colors.primary : (isDark ? '#333' : '#F0F0F0'),
                            alignSelf: isUser ? 'flex-end' : 'flex-start'
                        }
                    ]}
                >
                    <Text style={[
                        styles.messageText,
                        { color: isUser ? '#FFF' : (isDark ? '#FFF' : '#333') }
                    ]}>
                        {item.text}
                    </Text>
                </Animated.View>

                {/* Product Cards (If AI sends products) */}
                {!isUser && item.products && item.products.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsContainer}>
                        {item.products.map((product, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => handleProductPress(product)}
                                style={[styles.productCard, { backgroundColor: isDark ? '#222' : '#FFF' }]}
                            >
                                <Image source={{ uri: product.image }} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text numberOfLines={1} style={[styles.productName, { color: isDark ? '#FFF' : '#000' }]}>{product.title}</Text>
                                    <Text style={styles.productPrice}>${product.price}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={isDark ? 50 : 30} tint={isDark ? "dark" : "light"} style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <Animated.View entering={SlideInDown.springify()} style={[styles.content, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>

                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#EEE' }]}>
                            <View style={styles.headerTitleContainer}>
                                <View style={[styles.avatar, { backgroundColor: RevolutionTheme.colors.primary }]}>
                                    <Ionicons name="sparkles" size={18} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Catalan AI</Text>
                                    <Text style={styles.headerSubtitle}>مساعد التسوق</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={isDark ? '#AAA' : '#666'} />
                            </TouchableOpacity>
                        </View>

                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Typing Indicator */}
                        {isTyping && (
                            <View style={styles.typingContainer}>
                                <Text style={{ color: isDark ? '#AAA' : '#666', fontSize: 12 }}>جاري البحث...</Text>
                            </View>
                        )}

                        {/* Quick Replies - الأسئلة الشائعة */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.quickRepliesContainer}
                            contentContainerStyle={styles.quickRepliesContent}
                        >
                            {[
                                { emoji: '👕', text: 'عندكم هوديز؟' },
                                { emoji: '🧥', text: 'أبي جاكيت' },
                                { emoji: '👖', text: 'سراويل جينز' },
                                { emoji: '📏', text: 'المقاسات المتوفرة' },
                                { emoji: '🚚', text: 'معلومات التوصيل' },
                                { emoji: '💰', text: 'الأسعار' },
                                { emoji: '⭐', text: 'الأكثر مبيعاً' },
                                { emoji: '🔥', text: 'التخفيضات' },
                                { emoji: '💡', text: 'نصيحة تنسيق' },
                                { emoji: '❓', text: 'كيف تساعدني؟' },
                            ].map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setInputText(item.text);
                                        // Auto send after small delay
                                        setTimeout(() => {
                                            const userMsg = { id: Date.now().toString(), text: item.text, sender: 'user', products: [] };
                                            setMessages(prev => [...prev, userMsg]);
                                            setInputText("");
                                            setIsTyping(true);
                                            setTimeout(() => {
                                                const { text, products } = generateResponse(item.text);
                                                const aiMsg = { id: (Date.now() + 1).toString(), text: text, sender: 'ai', products: products };
                                                setMessages(prev => [...prev, aiMsg]);
                                                setIsTyping(false);
                                                setTimeout(() => {
                                                    flatListRef.current?.scrollToEnd({ animated: true });
                                                }, 100);
                                            }, 800);
                                        }, 100);
                                    }}
                                    style={[
                                        styles.quickReplyButton,
                                        {
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                        }
                                    ]}
                                >
                                    <Text style={styles.quickReplyEmoji}>{item.emoji}</Text>
                                    <Text style={[styles.quickReplyText, { color: isDark ? '#FFF' : '#333' }]}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={[styles.inputContainer, { borderTopColor: isDark ? '#333' : '#EEE' }]}>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: isDark ? '#333' : '#F5F5F5',
                                    color: isDark ? '#FFF' : '#000',
                                    textAlign: 'right'
                                }]}
                                placeholder="اكتب رسالتك هنا..."
                                placeholderTextColor={isDark ? '#AAA' : '#888'}
                                value={inputText}
                                onChangeText={setInputText}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                style={[styles.sendButton, { backgroundColor: RevolutionTheme.colors.primary }]}
                            >
                                <Ionicons name="send" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    keyboardView: {
        width: '100%',
        height: '85%',
    },
    content: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        direction: 'rtl', // Header RTL
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    closeButton: {
        padding: 8,
    },
    messagesList: {
        padding: 20,
        paddingBottom: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'right' // RTL Text
    },
    productsContainer: {
        marginTop: 5,
        marginBottom: 10,
        paddingLeft: 10, // RTL might need paddingRight
    },
    productCard: {
        width: 140,
        borderRadius: 12,
        marginRight: 10,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F0F0F0',
    },
    productInfo: {
        alignItems: 'flex-start',
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 12,
        color: RevolutionTheme.colors.primary,
        fontWeight: '700',
    },
    typingContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        alignItems: 'flex-end' // RTL Typing
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        flexDirection: 'row-reverse', // RTL Input Area
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Quick Replies Styles
    quickRepliesContainer: {
        maxHeight: 50,
        marginBottom: 10,
    },
    quickRepliesContent: {
        paddingHorizontal: 16,
        gap: 10,
        alignItems: 'center',
        flexDirection: 'row-reverse', // RTL
    },
    quickReplyButton: {
        flexDirection: 'row-reverse', // RTL for Arabic
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    quickReplyEmoji: {
        fontSize: 16,
    },
    quickReplyText: {
        fontSize: 14,
        fontWeight: '600',
        writingDirection: 'rtl',
        textAlign: 'right',
    },
});

export default AIChatModal;
