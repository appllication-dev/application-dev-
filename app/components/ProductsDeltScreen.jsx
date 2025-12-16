import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState, useContext } from "react";
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
} from "react-native";
import { Image } from 'expo-image';
import Feather from "react-native-vector-icons/Feather";
import { useTranslation } from "../../src/hooks/useTranslation";
import { addProductReview, getProductReviews, deleteProductReview } from "../../src/services/firestoreProducts";
import { useAuth } from "../../src/context/AuthContext";
import * as SecureStore from 'expo-secure-store';
import { sanitizeEmail } from "../../src/utils/helpers";

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
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get("window");
const sizes = ["S", "M", "L", "XL"];
const colorsary = ["#b7adad", "#000000", "#006912", "#0004d7"];

import { useRouter } from "expo-router"; // Added useRouter

const ProductsDeltScreen = () => {
    const navigation = useNavigation();
    const router = useRouter(); // Initialize router
    const { addToCart } = useContext(CartContext);
    const { colors, theme } = useTheme();
    const route = useRoute();
    const { t } = useTranslation();
    const item = route?.params?.item ?? {};
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

    // Handle like toggle
    const handleLikeReview = (reviewId) => {
        setLikedReviews(prev => {
            const newLikes = { ...prev };
            if (newLikes[reviewId]) {
                delete newLikes[reviewId];
            } else {
                newLikes[reviewId] = true;
            }
            return newLikes;
        });

        // Update review likes count in state
        setReviews(prevReviews =>
            prevReviews.map(review => {
                if (review.id === reviewId) {
                    const currentLikes = review.likes || 0;
                    const isLiked = likedReviews[reviewId];
                    return {
                        ...review,
                        likes: isLiked ? currentLikes - 1 : currentLikes + 1
                    };
                }
                return review;
            })
        );
    };

    // Get reviews to display (limited or all)
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    React.useEffect(() => {
        if (item?.id) {
            loadReviews();
        }
    }, [item]);

    const loadReviews = async () => {
        const result = await getProductReviews(item.id);
        if (result.success) {
            setReviews(result.reviews);
        }
    };

    const handleSubmitReview = async () => {
        if (!user) {
            Alert.alert(t('loginRequired'), t('pleaseLoginToReview'));
            return;
        }
        if (!comment.trim()) {
            Alert.alert(t('error'), t('pleaseEnterComment'));
            return;
        }

        setSubmittingReview(true);
        try {
            // Get user name from available properties
            const userName = user.displayName || user.name || user.email?.split('@')[0] || 'Anonymous';

            // Get profile image from SecureStore (same key used in profile.jsx)
            let userProfileImage = null;
            try {
                const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
                userProfileImage = await SecureStore.getItemAsync(userImageKey);
            } catch (e) {
                console.log('Could not load profile image:', e);
            }

            await addProductReview(item.id, {
                userId: user.uid,
                user: userName,
                rating,
                text: comment,
                profileImage: userProfileImage
            });
            setShowReviewModal(false);
            setComment("");
            setRating(5);
            loadReviews();
            Alert.alert(t('success'), t('reviewAdded'));
        } catch (error) {
            Alert.alert(t('error'), t('reviewFailed'));
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        Alert.alert(
            t('deleteReview'),
            t('confirmDeleteReview'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        // Optimistic Update: Remove immediately from UI
                        const originalReviews = [...reviews];
                        setReviews(prev => prev.filter(r => r.id !== reviewId));

                        try {
                            const result = await deleteProductReview(item.id, reviewId);
                            if (result.success) {
                                // Success - UI is already updated. 
                                // Optionally reload silently after a delay to sync
                                // loadReviews(); 
                            } else {
                                // Revert if failed
                                setReviews(originalReviews);
                                Alert.alert(t('error'), t('somethingWrong'));
                            }
                        } catch (error) {
                            // Revert if error
                            setReviews(originalReviews);
                            Alert.alert(t('error'), t('somethingWrong'));
                        }
                    }
                }
            ]
        );
    };

    const isDark = theme === 'dark';

    // Button Animation - Enhanced
    const buttonScale = useSharedValue(1);
    const checkmarkScale = useSharedValue(0);
    const checkmarkOpacity = useSharedValue(0);
    const successBgOpacity = useSharedValue(0);

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }]
    }));

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
        opacity: checkmarkOpacity.value,
    }));

    const successBgStyle = useAnimatedStyle(() => ({
        opacity: successBgOpacity.value,
    }));

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    };

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / Dimensions.get("window").width);
        setCurrentImageIndex(index);
    };

    const navigateToCart = () => {
        router.push("/(tabs)/Basket");
    };

    const handleAddTOCart = async (product) => {
        if (!selectedSize || !selectedColor) {
            // Shake animation for error
            buttonScale.value = withSequence(
                withTiming(1.02, { duration: 50 }),
                withTiming(0.98, { duration: 50 }),
                withTiming(1.02, { duration: 50 }),
                withTiming(0.98, { duration: 50 }),
                withTiming(1, { duration: 50 })
            );

            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (e) { }

            Alert.alert(
                t('selectionRequired'),
                t('selectSizeAndColor')
            );
            return;
        }

        // Success haptic
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) { }

        // Celebration animation sequence
        buttonScale.value = withSequence(
            withTiming(0.85, { duration: 100, easing: Easing.out(Easing.quad) }),
            withSpring(1.08, { damping: 8, stiffness: 400 }),
            withSpring(1, { damping: 12, stiffness: 200 })
        );

        // Show success background
        successBgOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(600, withTiming(0, { duration: 300 }))
        );

        // Show checkmark with bounce
        checkmarkOpacity.value = withTiming(1, { duration: 150 });
        checkmarkScale.value = withSequence(
            withTiming(0, { duration: 0 }),
            withSpring(1.2, { damping: 6, stiffness: 300 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        );

        const productToAdd = {
            ...product,
            size: selectedSize,
            color: selectedColor,
        };

        // Add to cart
        addToCart(productToAdd);

        // Show modal and navigate after delay
        setShowAddedModal(true);

        setTimeout(() => {
            setShowAddedModal(false);
            checkmarkOpacity.value = 0;
            checkmarkScale.value = 0;
            runOnJS(navigateToCart)();
        }, 1200);
    };

    const flatListRef = useAnimatedRef();

    const handleDotPress = (index) => {
        setCurrentImageIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const handleNextImage = () => {
        if (currentImageIndex < (item.images?.length || 0) - 1) {
            const nextIndex = currentImageIndex + 1;
            setCurrentImageIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            const prevIndex = currentImageIndex - 1;
            setCurrentImageIndex(prevIndex);
            flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent
            />

            {/* Full Screen Image */}
            <View style={styles.imageContainer}>
                {item.images && item.images.length > 1 ? (
                    <Animated.FlatList
                        ref={flatListRef}
                        data={item.images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(img, index) => index.toString()}
                        onMomentumScrollEnd={handleScroll}
                        renderItem={({ item: imgUri, index }) => (
                            <View style={{ width: Dimensions.get('window').width, height: '100%' }}>
                                <Animated.Image
                                    sharedTransitionTag={index === 0 ? `image-${item.id}` : undefined}
                                    source={{ uri: imgUri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    />
                ) : (
                    <Animated.View
                        sharedTransitionTag={`image-${item.id}`}
                        style={StyleSheet.absoluteFill}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            contentFit="cover"
                            transition={500}
                            cachePolicy="memory-disk"
                        />
                    </Animated.View>
                )}
                <View style={styles.imageOverlay} />

                {/* Pagination Dots */}
                {item.images && item.images.length > 1 && (
                    <View style={styles.paginationContainer}>
                        {item.images.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleDotPress(index)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <View
                                    style={[
                                        styles.paginationDot,
                                        index === currentImageIndex ? styles.paginationDotActive : styles.paginationDotInactive
                                    ]}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Left Arrow */}
                {item.images && item.images.length > 1 && currentImageIndex > 0 && (
                    <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowLeft]}
                        onPress={handlePrevImage}
                    >
                        <Feather name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}

                {/* Right Arrow */}
                {item.images && item.images.length > 1 && currentImageIndex < item.images.length - 1 && (
                    <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowRight]}
                        onPress={handleNextImage}
                    >
                        <Feather name="chevron-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}


                {/* Header Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(26,26,26,0.9)' : '#FFFFFF' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={22} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]} numberOfLines={1}>
                        {item.title?.toUpperCase() || 'PRODUCT'}
                    </Text>

                    <TouchableOpacity style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(26,26,26,0.9)' : '#FFFFFF' }]}>
                        <Feather name="heart" size={22} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                </View>

                {/* 3D View Button - Coming Soon */}
                <TouchableOpacity
                    style={styles.view3DButton}
                    onPress={() => Alert.alert(
                        "360° View",
                        "This feature is coming soon! 🚀\n\nWe're working on adding immersive 360° product views.",
                        [{ text: "OK", style: "default" }]
                    )}
                >
                    <Feather name="box" size={18} color="#FFFFFF" />
                    <Text style={styles.view3DText}>360°</Text>
                </TouchableOpacity>
            </View>

            {/* Content Sheet */}
            <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.price, { color: colors.primary }]}>${item.price}</Text>
                        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('size')}</Text>
                        <View style={styles.optionsRow}>
                            {sizes.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.sizeOption,
                                        { borderColor: isDark ? colors.border : '#E0E0E0' },
                                        selectedSize === size && styles.selectedSizeOption,
                                    ]}
                                    onPress={() => setSelectedSize(size)}
                                >
                                    <Text
                                        style={[
                                            styles.sizeText,
                                            { color: colors.text },
                                            selectedSize === size && styles.selectedSizeText,
                                        ]}
                                    >
                                        {size}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('color')}</Text>
                        <View style={styles.optionsRow}>
                            {colorsary.map((color, idx) => (
                                <TouchableOpacity
                                    key={color + idx}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorOptionWrapper,
                                        selectedColor === color && { borderColor: color },
                                    ]}
                                >
                                    <View style={[styles.colorOption, { backgroundColor: color }]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.descriptionSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('description')}</Text>
                        <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                            {t('mockProductDescription')}
                        </Text>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.reviewsHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {t('reviews')} {reviews.length > 0 ? `(${reviews.length})` : ''}
                            </Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                                <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('writeReview')}</Text>
                            </TouchableOpacity>
                        </View>

                        {reviews.length === 0 ? (
                            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>{t('noReviewsYet')}</Text>
                        ) : (
                            <>
                                {displayedReviews.map((review) => (
                                    <View key={review.id} style={[styles.reviewItem, { backgroundColor: isDark ? colors.card : '#F9F9F9' }]}>
                                        <View style={styles.reviewHeader}>
                                            <View style={styles.reviewerInfo}>
                                                {review.profileImage ? (
                                                    <Image
                                                        source={{ uri: review.profileImage }}
                                                        style={styles.reviewerAvatar}
                                                        contentFit="cover"
                                                    />
                                                ) : (
                                                    <View style={styles.avatarPlaceholder}>
                                                        <Text style={styles.avatarText}>{review.user ? review.user.charAt(0).toUpperCase() : 'U'}</Text>
                                                    </View>
                                                )}
                                                <Text style={[styles.reviewerName, { color: colors.text }]}>{review.user}</Text>
                                            </View>
                                            <View style={[styles.ratingContainer, { backgroundColor: isDark ? 'rgba(255,217,0,0.2)' : '#FFF9E6' }]}>
                                                <Feather name="star" size={12} color="#FFD700" style={{ marginRight: 2 }} />
                                                <Text style={[styles.ratingText, { color: colors.text }]}>{review.rating}.0</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.text}</Text>

                                        {/* Review Footer with Date and Like */}
                                        <View style={styles.reviewFooter}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.reviewDate, { color: colors.textLight }]}>{review.date}</Text>
                                                {user && review.userId === user.uid && (
                                                    <TouchableOpacity
                                                        style={{ marginLeft: 15 }}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                        onPress={() => handleDeleteReview(review.id)}
                                                    >
                                                        <Feather name="trash-2" size={16} color={colors.error || '#DC2626'} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <TouchableOpacity
                                                style={styles.likeButton}
                                                onPress={() => handleLikeReview(review.id)}
                                            >
                                                <Feather
                                                    name={likedReviews[review.id] ? "heart" : "heart"}
                                                    size={16}
                                                    color={likedReviews[review.id] ? "#FF4757" : colors.textLight}
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={[styles.likeCount, { color: likedReviews[review.id] ? "#FF4757" : colors.textLight }]}>
                                                    {(review.likes || 0) + (likedReviews[review.id] ? 1 : 0)}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                {/* See All / Show Less Button */}
                                {reviews.length > 2 && (
                                    <TouchableOpacity
                                        style={[styles.seeAllButton, { borderColor: colors.border }]}
                                        onPress={() => setShowAllReviews(!showAllReviews)}
                                    >
                                        <Text style={[styles.seeAllButtonText, { color: colors.primary }]}>
                                            {showAllReviews ? t('showLess') : `${t('seeAll')} (${reviews.length})`}
                                        </Text>
                                        <Feather
                                            name={showAllReviews ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* Review Modal */}
                <Modal
                    visible={showReviewModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowReviewModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('writeReview')}</Text>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Feather
                                            name="star"
                                            size={32}
                                            color={star <= rating ? "#FFD700" : colors.border}
                                            style={{ marginHorizontal: 4 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.commentInput, {
                                    color: colors.text,
                                    backgroundColor: isDark ? colors.background : '#F5F5F5',
                                    borderColor: colors.border
                                }]}
                                placeholder={t('writeYourReview')}
                                placeholderTextColor={colors.textLight}
                                multiline
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.border }]}
                                    onPress={() => setShowReviewModal(false)}
                                >
                                    <Text style={{ color: colors.text }}>{t('cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                    onPress={handleSubmitReview}
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? (
                                        <ActivityIndicator color={colors.textInverse} />
                                    ) : (
                                        <Text style={{ color: colors.textInverse }}>{t('submit')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Add to Cart Success Modal */}
                <Modal
                    visible={showAddedModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.successModalOverlay}>
                        <Animated.View style={[styles.successModalContent, successBgStyle]}>
                            <Animated.View style={[styles.successCheckContainer, checkmarkStyle]}>
                                <View style={styles.successCheckCircle}>
                                    <Feather name="check" size={40} color="#000" />
                                </View>
                            </Animated.View>
                            <Text style={styles.successTitle}>{t('addedToCart') || 'Added to Cart!'}</Text>
                            <Text style={styles.successSubtitle}>{item.title}</Text>
                        </Animated.View>
                    </View>
                </Modal>


                {/* Bottom Action Button */}
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: isDark ? colors.border : '#F0F0F0' }]}>
                    <Animated.View style={[buttonStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={[styles.addToCartButton, { flex: 1, marginRight: 10 }]}
                            onPress={() => handleAddTOCart(item)}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={0.9}
                        >
                            <Feather name="shopping-bag" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                            <Text style={styles.addToCartText}>{t('addToCart')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.addToCartButton, { width: 56, backgroundColor: isDark ? colors.card : '#F0F0F0' }]}
                            onPress={() => setShowReviewModal(true)}
                        >
                            <Feather name="star" size={20} color={isDark ? colors.text : '#1A1A1A'} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    imageContainer: {
        height: height * 0.55,
        width: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.02)",
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 8,
        zIndex: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    paginationDotActive: {
        backgroundColor: '#D4AF37', // Gold
        width: 20,
    },
    paginationDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    navArrow: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    navArrowLeft: {
        left: 10,
    },
    navArrowRight: {
        right: 10,
    },
    topBar: {

        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        marginHorizontal: 12,
    },
    view3DButton: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.85)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 6,
        zIndex: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    view3DText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    contentContainer: {
        flex: 1,
        marginTop: -40,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    price: {
        fontSize: 28,
        fontWeight: "700",
        color: "#D4AF37", // Gold
        marginBottom: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    sizeOption: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginRight: 12,
        marginBottom: 12,
        minWidth: 60,
        alignItems: 'center',
    },
    selectedSizeOption: {
        backgroundColor: "#1A1A1A",
        borderColor: "#1A1A1A",
    },
    sizeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    selectedSizeText: {
        color: "#FFFFFF",
    },
    colorOptionWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
        marginBottom: 12,
    },
    colorOption: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 22,
    },
    footer: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 0,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        marginBottom: -40
    },
    addToCartButton: {
        backgroundColor: "#1A1A1A",
        borderRadius: 50,
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,

        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 1,
    },
    reviewsSection: {
        marginBottom: 24,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        color: '#D4AF37', // Gold
        fontWeight: '600',
    },
    reviewItem: {
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    reviewText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999999',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    likeCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 8,
    },
    seeAllButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentInput: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        height: 100,
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Success Modal Styles
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        alignItems: 'center',
        padding: 40,
    },
    successCheckContainer: {
        marginBottom: 24,
    },
    successCheckCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E5C158',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E5C158',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        maxWidth: 250,
    },
});

export default ProductsDeltScreen;