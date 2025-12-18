import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState, useContext, useEffect, useRef } from "react";
import { CartContext } from "../../src/context/CardContext";
import { useTheme } from "../../src/context/ThemeContext";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    Dimensions,
    Modal,
    TextInput,
    ActivityIndicator,
    Platform
} from "react-native";
import { Image } from 'expo-image';
import Feather from "react-native-vector-icons/Feather";
import { useTranslation } from "../../src/hooks/useTranslation";
import { addProductReview, getProductReviews, deleteProductReview } from "../../src/services/firestoreProducts";
import { useAuth } from "../../src/context/AuthContext";
import * as SecureStore from 'expo-secure-store';
import { sanitizeEmail } from "../../src/utils/helpers";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedRef,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    runOnJS,
    Easing,
    interpolate,
    Extrapolate,
    useAnimatedScrollHandler
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";

const { height, width } = Dimensions.get("window");
const sizes = ["S", "M", "L", "XL"];
const colorsary = ["#b7adad", "#000000", "#006912", "#0004d7"];

const ProductsDeltScreen = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const { addToCart } = useContext(CartContext);
    const { colors, theme } = useTheme();
    const route = useRoute();
    const { t } = useTranslation();

    // Param Parsing
    let item = route?.params?.item ?? {};
    if (typeof item === 'string') {
        try {
            item = JSON.parse(item);
        } catch (e) {
            console.error("Failed to parse item param:", e);
        }
    }

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAddedModal, setShowAddedModal] = useState(false);

    // Reviews State
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [likedReviews, setLikedReviews] = useState({});

    const isDark = theme === 'dark';

    // Animations
    const scrollY = useSharedValue(0);
    const imageScale = useSharedValue(1.1); // Start slightly zoomed in
    const contentTranslateY = useSharedValue(height); // Start off screen

    useEffect(() => {
        // Entrance Animation
        imageScale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
        contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100, mass: 0.8 });

        if (item?.id) {
            loadReviews();
        }
    }, [item]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Parallax & Blur Effect for Image
    const imageAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [-height, 0, height],
            [-height / 2, 0, height * 0.5],
            Extrapolate.CLAMP
        );
        const scale = interpolate(
            scrollY.value,
            [-height, 0],
            [2, 1],
            Extrapolate.CLAMP
        );
        return {
            transform: [
                { translateY },
                { scale: scale * imageScale.value } // Combine entrance zoom with scroll zoom
            ],
        };
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 200],
            [0, 1],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    // --- Logic Functions (Reviews, Cart, etc.) ---
    // (Kept similar to before but optimized)
    const loadReviews = async () => {
        const result = await getProductReviews(item.id);
        if (result.success) {
            setReviews(result.reviews);
            if (user) {
                const likedState = {};
                result.reviews.forEach(review => {
                    if (review.likedBy?.includes(user.uid)) likedState[review.id] = true;
                });
                setLikedReviews(likedState);
            }
        }
    };

    const handleLikeReview = async (reviewId) => {
        if (!user) {
            Alert.alert(t('loginRequired'), t('pleaseLoginToReview'));
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLikedReviews(prev => {
            const isLiked = !!prev[reviewId];
            const newLikes = { ...prev };
            if (isLiked) delete newLikes[reviewId];
            else newLikes[reviewId] = true;
            return newLikes;
        });
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                const isLiked = likedReviews[reviewId];
                return { ...r, likes: isLiked ? Math.max(0, (r.likes || 0) - 1) : (r.likes || 0) + 1 };
            }
            return r;
        }));
        try {
            const { toggleReviewLike } = require("../../src/services/firestoreProducts");
            await toggleReviewLike(item.id, reviewId, user.uid);
        } catch (e) { console.error(e); }
    };

    const handleSubmitReview = async () => {
        if (!user) return Alert.alert(t('loginRequired'), t('pleaseLoginToReview'));
        if (!comment.trim()) return Alert.alert(t('error'), t('pleaseEnterComment'));

        const userName = user.displayName || user.name || user.email?.split('@')[0] || 'Anonymous';
        let userProfileImage = null;
        try {
            const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
            userProfileImage = await SecureStore.getItemAsync(userImageKey);
        } catch (e) { }

        // Optimistic Update
        const newReview = {
            id: Date.now().toString(),
            userId: user.uid,
            user: userName,
            rating,
            text: comment,
            profileImage: userProfileImage,
            timestamp: new Date().toISOString()
        };

        setReviews(prev => [newReview, ...prev]);
        setShowReviewModal(false);
        setComment("");
        setRating(5);

        setSubmittingReview(true);
        try {
            await addProductReview(item.id, { userId: user.uid, user: userName, rating, text: comment, profileImage: userProfileImage });
            loadReviews();
            Alert.alert(t('success'), t('reviewAdded'));
        } catch (error) {
            setReviews(prev => prev.filter(r => r.id !== newReview.id));
            Alert.alert(t('error'), t('reviewFailed'));
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        Alert.alert(t('deleteReview'), t('confirmDeleteReview'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('delete'), style: 'destructive', onPress: async () => {
                    setReviews(prev => prev.filter(r => r.id !== reviewId));
                    await deleteProductReview(item.id, reviewId);
                }
            }
        ]);
    };

    // Cart Animation
    const buttonScale = useSharedValue(1);
    const handleAddTOCart = async () => {
        if (!selectedSize || !selectedColor) {
            buttonScale.value = withSequence(
                withTiming(1.1, { duration: 50 }),
                withTiming(0.9, { duration: 50 }),
                withTiming(1, { duration: 50 })
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(t('selectionRequired'), t('selectSizeAndColor'));
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addToCart({ ...item, size: selectedSize, color: selectedColor });
        setShowAddedModal(true);
        setTimeout(() => {
            setShowAddedModal(false);
            router.push("/(tabs)/Basket");
        }, 1200);
    };

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Background Image with Parallax */}
            <Animated.View style={[styles.imageBackgroundContainer, imageAnimatedStyle]}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.backgroundImage}
                    contentFit="cover"
                    transition={500}
                />
                {/* Improved Gradient - Less overlay for better image visibility */}
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0.05)',
                        'transparent',
                        'transparent',
                        isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                        isDark ? '#000' : '#FFF'
                    ]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.15, 0.5, 0.75, 1]}
                />
            </Animated.View>

            {/* Custom Header */}
            <View style={styles.headerContainer}>
                <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.headerTitle, headerAnimatedStyle]}>
                        {item.title}
                    </Animated.Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="share-2" size={24} color="#FFF" />
                    </TouchableOpacity>
                </BlurView>
            </View>

            {/* Main Scrollable Content */}
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: height * 0.9, paddingBottom: 120 }}
            >
                {/* Glassmorphism Details Card */}
                <Animated.View style={[
                    styles.detailsCard,
                    {
                        backgroundColor: isDark ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        transform: [{ translateY: contentTranslateY }]
                    }
                ]}>
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 0} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />

                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    {/* Title & Price */}
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.brandText, { color: RevolutionTheme.colors.primary }]}>PREMIUM COLLECTION</Text>
                            <Text style={[styles.productTitle, { color: isDark ? '#FFF' : '#000' }]}>{item.title}</Text>
                            <View style={styles.ratingRow}>
                                <Feather name="star" size={14} color="#FFD700" />
                                <Text style={[styles.ratingText, { color: isDark ? '#CCC' : '#666' }]}>
                                    {item.rating?.rate || 4.8} ({item.rating?.count || 120} reviews)
                                </Text>
                            </View>
                        </View>
                        <View style={styles.priceTag}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.priceValue}>{item.price}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                    {/* Selectors */}
                    <View style={styles.selectorsContainer}>
                        {/* Sizes */}
                        <View style={styles.selectorGroup}>
                            <Text style={[styles.sectionLabel, { color: isDark ? '#AAA' : '#555' }]}>{t('size')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                                {sizes.map((size) => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedSize(size);
                                        }}
                                        style={[
                                            styles.sizeOption,
                                            selectedSize === size && styles.sizeOptionSelected,
                                            { borderColor: isDark ? '#333' : '#EEE', backgroundColor: selectedSize === size ? RevolutionTheme.colors.primary : 'transparent' }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.sizeText,
                                            { color: selectedSize === size ? '#000' : (isDark ? '#FFF' : '#000') }
                                        ]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Colors */}
                        <View style={styles.selectorGroup}>
                            <Text style={[styles.sectionLabel, { color: isDark ? '#AAA' : '#555' }]}>{t('color')}</Text>
                            <View style={styles.colorsRow}>
                                {colorsary.map((color, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedColor(color);
                                        }}
                                        style={[
                                            styles.colorOptionWrapper,
                                            selectedColor === color && { borderColor: color }
                                        ]}
                                    >
                                        <View style={[styles.colorCircle, { backgroundColor: color }]} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionContainer}>
                        <Text style={[styles.sectionLabel, { color: isDark ? '#AAA' : '#555' }]}>{t('description')}</Text>
                        <Text style={[styles.descriptionText, { color: isDark ? '#DDD' : '#444' }]}>
                            {t('mockProductDescription')}
                        </Text>
                    </View>

                    {/* Reviews Preview */}
                    <View style={styles.reviewsContainer}>
                        <View style={styles.reviewsHeader}>
                            <Text style={[styles.sectionLabel, { color: isDark ? '#AAA' : '#555' }]}>{t('reviews')}</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                                <Text style={{ color: RevolutionTheme.colors.primary, fontWeight: '600' }}>{t('writeReview')}</Text>
                            </TouchableOpacity>
                        </View>
                        {displayedReviews.map(review => (
                            <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9' }]}>
                                <View style={styles.reviewHeaderRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Image
                                            source={{ uri: review.profileImage || `https://ui-avatars.com/api/?name=${review.user}&background=random` }}
                                            style={{ width: 32, height: 32, borderRadius: 16 }}
                                            contentFit="cover"
                                        />
                                        <Text style={[styles.reviewerName, { color: isDark ? '#FFF' : '#000' }]}>{review.user}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Feather key={i} name="star" size={10} color={i < review.rating ? "#FFD700" : "#555"} />
                                        ))}
                                    </View>
                                </View>
                                <Text style={[styles.reviewBody, { color: isDark ? '#CCC' : '#666' }]}>{review.text}</Text>
                            </View>
                        ))}
                    </View>

                </Animated.View>
            </Animated.ScrollView>

            {/* Floating Bottom Bar (Glass) */}
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={styles.bottomBar}>
                <View style={styles.bottomBarContent}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.totalLabel, { color: isDark ? '#AAA' : '#666' }]}>Total Price</Text>
                        <Text style={[styles.totalPrice, { color: isDark ? '#FFF' : '#000' }]}>${item.price}</Text>
                    </View>

                    <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleAddTOCart}
                        >
                            <LinearGradient
                                colors={[RevolutionTheme.colors.primary, '#D4AF37']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.addToCartBtn}
                            >
                                <Feather name="shopping-bag" size={20} color="#000" style={{ marginRight: 8 }} />
                                <Text style={styles.addToCartText}>{t('addToCart')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </BlurView>

            {/* Modals (Review & Success) - Simplified for brevity but functional */}
            <Modal visible={showAddedModal} transparent animationType="fade">
                <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
                    <View style={styles.successBox}>
                        <View style={styles.checkCircle}>
                            <Feather name="check" size={40} color="#FFF" />
                        </View>
                        <Text style={styles.successText}>{t('addedToCart')}</Text>
                    </View>
                </BlurView>
            </Modal>

            <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('writeReview')}</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                                    <Feather name="star" size={32} color={s <= rating ? "#FFD700" : "#CCC"} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={[styles.input, { color: isDark ? '#FFF' : '#000', backgroundColor: isDark ? '#333' : '#F5F5F5' }]}
                            placeholder={t('writeYourReview')}
                            placeholderTextColor="#888"
                            multiline
                            value={comment}
                            onChangeText={setComment}
                        />
                        <TouchableOpacity onPress={handleSubmitReview} style={styles.submitBtn}>
                            <Text style={styles.submitText}>{t('submit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.cancelBtn}>
                            <Text style={{ color: '#888' }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height, // Full screen height
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    headerContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    headerBlur: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 30,
        overflow: 'hidden',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    detailsCard: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        paddingBottom: 100,
        minHeight: height * 0.6,
        overflow: 'hidden',
        borderWidth: 1,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(150,150,150,0.5)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    brandText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    productTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
        letterSpacing: 0.5,
        lineHeight: 34,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    currency: {
        fontSize: 16,
        fontWeight: '700',
        color: RevolutionTheme.colors.primary,
        marginTop: 4,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: '900',
        color: RevolutionTheme.colors.primary,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 20,
    },
    selectorsContainer: {
        marginBottom: 24,
    },
    selectorGroup: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsScroll: {
        gap: 12,
    },
    sizeOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeOptionSelected: {
        borderWidth: 0,
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '700',
    },
    colorsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    colorOptionWrapper: {
        padding: 3,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.9,
    },
    descriptionContainer: {
        marginBottom: 30,
    },
    reviewsContainer: {
        marginBottom: 20,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    reviewHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reviewerName: {
        fontWeight: '700',
        fontSize: 14,
    },
    reviewBody: {
        fontSize: 13,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    priceContainer: {
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: '800',
    },
    addToCartBtn: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E5C158',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    successBox: {
        backgroundColor: '#FFF',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
    },
    checkCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    modalContent: {
        width: '85%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 100,
        borderRadius: 16,
        padding: 16,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitBtn: {
        width: '100%',
        height: 50,
        backgroundColor: RevolutionTheme.colors.primary,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    submitText: {
        fontWeight: '700',
        color: '#000',
    },
    cancelBtn: {
        padding: 10,
    },
});

export default ProductsDeltScreen;