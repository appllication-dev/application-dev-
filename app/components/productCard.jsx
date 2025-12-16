import { useNavigation } from "@react-navigation/native";
import { Text, View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useTheme } from "../../src/context/ThemeContext";
import { Shadows, BorderRadius, SpringConfig } from "../../constants/theme";
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import { BlurView } from "expo-blur"; // Import BlurView

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProductCard = ({ item, onLike }) => {
    if (!item) {
        return null;
    }

    const { isFavorite } = useFavorites();
    const { colors, theme } = useTheme();
    const isProductLiked = isFavorite(item.id);
    const navigation = useNavigation();
    const isDark = theme === 'dark';

    // Premium spring animations
    const scale = useSharedValue(1);
    const shadowOpacity = useSharedValue(isDark ? 0.3 : 0.1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowOpacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, SpringConfig.light);
        shadowOpacity.value = withTiming(isDark ? 0.5 : 0.15, { duration: 150 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SpringConfig.medium);
        shadowOpacity.value = withTiming(isDark ? 0.3 : 0.1, { duration: 150 });
    };

    // Dynamic Styles based on Theme
    const cardBg = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const borderColor = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const textColor = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const secondaryTextColor = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;

    return (
        <AnimatedTouchable
            style={[
                styles.container,
                {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                },
                isDark ? styles.shadowDark : styles.shadowLight,
                animatedStyle
            ]}
            onPress={() => navigation.navigate("ProductsDelt", { item })}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Gradient Overlay for Text Readability on Image (if needed, but using card style) */}
                {/* <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.3)']} 
                    style={StyleSheet.absoluteFill} 
                /> */}

                {/* Like Button - Glassmorphism */}
                <BlurView intensity={isDark ? 20 : 10} tint={isDark ? "dark" : "light"} style={styles.likeButtonContainer}>
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => onLike(item.id)}
                        activeOpacity={0.7}
                    >
                        {isProductLiked ? (
                            <FontAwesome name="heart" size={18} color={RevolutionTheme.colors.primary} />
                        ) : (
                            <Feather name="heart" size={18} color={isDark ? "#FFF" : "#555"} />
                        )}
                    </TouchableOpacity>
                </BlurView>

                {/* Badge - Luxury Gold */}
                {item.isNew && (
                    <View style={styles.badge}>
                        <LinearGradient
                            colors={[RevolutionTheme.colors.primary, RevolutionTheme.colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.badgeGradient}
                        >
                            <Text style={styles.badgeText}>NEW</Text>
                        </LinearGradient>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {item.title}
                </Text>

                <View style={styles.infoRow}>
                    <View style={styles.priceWrapper}>
                        <Text style={[styles.currency, { color: RevolutionTheme.colors.primary }]}>$</Text>
                        <Text style={[styles.price, { color: textColor }]}>{item.price}</Text>
                    </View>

                    {item.rating && (
                        <View style={styles.ratingContainer}>
                            <FontAwesome name="star" size={12} color={RevolutionTheme.colors.primary} />
                            <Text style={[styles.ratingText, { color: secondaryTextColor }]}>{item.rating.rate}</Text>
                        </View>
                    )}
                </View>
            </View>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%", // Controlled by parent usually (FlatList numColumns) but here full
        borderRadius: 24,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
    },
    shadowDark: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shadowLight: {
        shadowColor: "#D4AF37", // Gold tinted shadow for light mode
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    imageWrapper: {
        height: 180,
        width: "100%",
        position: 'relative',
    },
    image: {
        width: "100%",
        height: "100%",
    },
    likeButtonContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    likeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(255,255,255,0.1)', // Subtle for glass effect
    },
    badge: {
        position: "absolute",
        top: 10,
        left: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    badgeGradient: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    badgeText: {
        color: "#000",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1,
    },
    contentContainer: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    currency: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
        marginRight: 2,
    },
    price: {
        fontSize: 18,
        fontWeight: "800",
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "600",
    },
});

export default ProductCard;