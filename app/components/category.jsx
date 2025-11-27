import { Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useTheme } from "../../src/context/ThemeContext";
import { BorderRadius, Spacing, SpringConfig } from "../../constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Category = ({ item, selectedCategory, setSelectedCategory }) => {
    const { colors } = useTheme();
    const isSelected = selectedCategory === item;
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
            onPress={() => setSelectedCategory(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animatedStyle]}
            activeOpacity={0.9}
        >
            <Text
                style={[
                    styles.category,
                    {
                        color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                    },
                    isSelected && { color: colors.primary } // Override text color for selected state to be primary color (e.g. blue/purple) on white background
                ]}
            >
                {item}
            </Text>
        </AnimatedTouchable>
    );
};

export default Category;

const styles = StyleSheet.create({
    category: {
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
        borderRadius: BorderRadius.full,
        paddingHorizontal: 20,
        paddingVertical: 11,
        marginHorizontal: 6,
        letterSpacing: 0.2,
        overflow: 'hidden',
    },
});