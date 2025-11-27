import { useNavigation } from "@react-navigation/native";
import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProductCard = ({ item, onLike }) => {
    if (!item) {
        return null;
    }

    const { isFavorite } = useFavorites();
    const { colors } = useTheme();
    const isProductLiked = isFavorite(item.id);
    const navigation = useNavigation();

    // Premium spring animations
    const scale = useSharedValue(1);
    const shadowOpacity = useSharedValue(0.15);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowOpacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, SpringConfig.light);
        shadowOpacity.value = withTiming(0.08, { duration: 150 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SpringConfig.medium);
        shadowOpacity.value = withTiming(0.15, { duration: 150 });
    };

    return (
        <AnimatedTouchable
            style={[
                styles.container,
                {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                },
                Shadows.lg,
                animatedStyle
            ]}
            onPress={() => navigation.navigate("ProductsDelt", { item })}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                {/* Glassmorphic Like Button */}
                <TouchableOpacity
                    style={[
                        styles.likeButton,
                        { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
                    ]}
                    onPress={() => onLike(item.id)}
                    activeOpacity={0.8}
                >
                    {isProductLiked ? (
                        <FontAwesome name="heart" size={18} color="#EF4444" />
                    ) : (
                        <Feather name="heart" size={18} color="#FFFFFF" />
                    )}
                </TouchableOpacity>

                {/* Optional: NEW Badge */}
                {item.isNew && (
                    <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.badgeText}>NEW</Text>
                    </View>
                )}
            </View>

            <View style={styles.detailsContainer}>
                <Text style={[styles.title, { color: '#FFFFFF' }]} numberOfLines={1}>
                    {item.title}
                </Text>

                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: '#FFFFFF' }]}>
                        ${item.price}
                    </Text>
                    {item.originalPrice && (
                        <Text style={[styles.originalPrice, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                            ${item.originalPrice}
                        </Text>
                    )}
                </View>
            </View>
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "48%",
        borderRadius: BorderRadius.xl,
        marginBottom: 16,
        overflow: "hidden",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 200,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    likeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badge: {
        position: "absolute",
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
    detailsContainer: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: "line-through",
    },
});

export default ProductCard;