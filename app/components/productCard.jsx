import { useNavigation } from "@react-navigation/native";
import { Text, View, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from "react-native-reanimated";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useContext, useState } from "react";
import { CartContext } from "../../src/context/CardContext"; // Note: Context file is named CardContext
import { useTheme } from "../../src/context/ThemeContext";
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useEffect } from "react";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get('window');

const ProductCard = ({ item, onLike, index }) => {
    if (!item) return null;

    const { isFavorite } = useFavorites();
    const { addToCart } = useContext(CartContext);
    const { theme } = useTheme();
    const isProductLiked = isFavorite(item.id);
    const navigation = useNavigation();
    const isDark = theme === 'dark';

    // Randomize slight floating delay to make it feel organic
    const floatDelay = index ? index * 200 : Math.random() * 1000;

    // Animations
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const cartScale = useSharedValue(1);

    const [isAdded, setIsAdded] = useState(false);

    // Initial Floating Animation (Dreamy Breath)
    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 2000 + floatDelay, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000 + floatDelay, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        textOpacity.value = withTiming(1, { duration: 800 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
    }));

    const cartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cartScale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    };

    const handleAddToCart = async () => {
        // Animation Sequence: Pop
        cartScale.value = withSequence(
            withTiming(1.5, { duration: 100 }),
            withSpring(1, { damping: 8 })
        );

        setIsAdded(true);
        await addToCart(item);

        // Reset icon after 1.5 seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    return (
        <AnimatedTouchable
            style={[styles.container, animatedStyle]}
            onPress={() => navigation.navigate("ProductsDelt", { item })}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            {/* Cinematic Full Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Subtle dark gradient at bottom for text readability */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.bottomGradient}
                />

                {/* Like Button (Floating Glass) */}
                <BlurView intensity={20} tint="dark" style={styles.likeGlass}>
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => onLike(item.id)}
                    >
                        {isProductLiked ? (
                            <FontAwesome name="heart" size={16} color={RevolutionTheme.colors.primary} />
                        ) : (
                            <Feather name="heart" size={16} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </BlurView>
            </View>

            {/* Dreamy Info Overlay (Glass) */}
            <BlurView
                intensity={Platform.OS === 'ios' ? 30 : 50}
                tint={isDark ? "dark" : "light"}
                style={[styles.infoGlass, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(212, 175, 55, 0.2)' }]}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={styles.priceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.currency, { color: RevolutionTheme.colors.primary }]}>$</Text>
                            <Text style={[styles.price, { color: isDark ? '#EEE' : '#333' }]}>{item.price}</Text>

                            {/* Rating Star */}
                            {item.rating && (
                                <View style={styles.ratingBox}>
                                    <FontAwesome name="star" size={10} color={RevolutionTheme.colors.primary} />
                                    <Text style={styles.ratingText}>{item.rating.rate}</Text>
                                </View>
                            )}
                        </View>

                        {/* Add to Cart Button */}
                        <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.7}>
                            <Animated.View style={[styles.cartButton, cartAnimatedStyle, { backgroundColor: isAdded ? RevolutionTheme.colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') }]}>
                                <Feather
                                    name={isAdded ? "check" : "shopping-bag"}
                                    size={16}
                                    color={isAdded ? '#FFF' : (isDark ? '#FFF' : '#333')}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 260, // Taller cinematic aspect ratio
        borderRadius: 24,
        marginBottom: 20,
        backgroundColor: 'transparent', // Let background show through
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, // Deep shadow for floating effect
        shadowRadius: 20,
        elevation: 10,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    likeGlass: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    likeButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoGlass: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 10,
    },
    textContainer: {
        // padding handled by glass view
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
        opacity: 0.9,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Push Cart button to right
    },
    currency: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
        marginRight: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        marginRight: 10,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4
    },
    ratingText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700'
    },
    cartButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProductCard;