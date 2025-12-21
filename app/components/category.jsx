import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // For t-shirt, user-tie, etc.
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useTheme } from "../../src/context/ThemeContext";
import { BorderRadius, Spacing, SpringConfig } from "../../constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Category = ({ item, selectedCategory, setSelectedCategory }) => {
    const { colors } = useTheme();
    // Support both old format (name) and new format (id + label)
    const categoryId = typeof item === 'string' ? item : (item.id || item.name);
    const categoryLabel = typeof item === 'object' ? (item.label || item.name) : item;
    const categoryIcon = typeof item === 'object' ? item.icon : null;
    const isSelected = selectedCategory === categoryId;
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, SpringConfig.bouncy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SpringConfig.bouncy);
    };

    return (
        <AnimatedTouchable
            onPress={() => setSelectedCategory(categoryId)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                animatedStyle,
                styles.container,
                {
                    backgroundColor: isSelected ? colors.card : colors.cardSecondary, // Inverted logic from image: Dark Button
                    borderColor: isSelected ? '#D4AF37' : colors.border,
                    borderWidth: 1,
                }
            ]}
            activeOpacity={0.9}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {categoryIcon && (
                    <FontAwesome5
                        name={categoryIcon}
                        size={16}
                        color={isSelected ? '#D4AF37' : colors.textSecondary}
                    />
                )}
                <Text
                    style={[
                        styles.text,
                        {
                            color: isSelected ? '#D4AF37' : colors.textSecondary,
                        },
                    ]}
                >
                    {categoryLabel}
                </Text>
            </View>
        </AnimatedTouchable>
    );
};

export default Category;

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.full,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});