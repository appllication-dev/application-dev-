import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../src/context/ThemeContext';

/**
 * Premium Input with floating label and focus animations
 * Apple-style input field with smooth transitions
 */
const PremiumInput = ({
    label,
    value,
    onChangeText,
    error,
    success,
    icon,
    ...props
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const labelPosition = useSharedValue(value ? 1 : 0);
    const borderColor = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    const labelStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: withSpring(labelPosition.value ? -24 : 0, {
                    damping: 20,
                    stiffness: 90,
                }),
            },
            {
                scale: withSpring(labelPosition.value ? 0.85 : 1, {
                    damping: 20,
                    stiffness: 90,
                }),
            },
        ],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? '#EF4444'
            : success
                ? '#10B981'
                : borderColor.value === 1
                    ? colors.primary
                    : colors.border,
        shadowOpacity: glowOpacity.value,
    }));

    const handleFocus = () => {
        setIsFocused(true);
        labelPosition.value = 1;
        borderColor.value = withTiming(1, { duration: 200 });
        glowOpacity.value = withTiming(0.15, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            labelPosition.value = 0;
        }
        borderColor.value = withTiming(0, { duration: 200 });
        glowOpacity.value = withTiming(0, { duration: 200 });
    };

    const handleChangeText = (text) => {
        onChangeText?.(text);
        if (text && !labelPosition.value) {
            labelPosition.value = 1;
        } else if (!text && !isFocused) {
            labelPosition.value = 0;
        }
    };

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.container, containerStyle, { borderColor: colors.border }]}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <Feather name={icon} size={20} color={colors.textLight} />
                    </View>
                )}

                <View style={styles.inputWrapper}>
                    <Animated.Text
                        style={[
                            styles.label,
                            { color: isFocused ? colors.primary : colors.textSecondary },
                            labelStyle,
                        ]}
                    >
                        {label}
                    </Animated.Text>

                    <TextInput
                        value={value}
                        onChangeText={handleChangeText}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        style={[styles.input, { color: colors.text }]}
                        placeholderTextColor={colors.textLight}
                        {...props}
                    />
                </View>

                {success && (
                    <View style={styles.statusIcon}>
                        <Feather name="check-circle" size={20} color="#10B981" />
                    </View>
                )}

                {error && (
                    <View style={styles.statusIcon}>
                        <Feather name="alert-circle" size={20} color="#EF4444" />
                    </View>
                )}
            </Animated.View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        minHeight: 56,
        backgroundColor: 'transparent',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 12,
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: 'transparent',
        paddingHorizontal: 4,
    },
    input: {
        fontSize: 16,
        paddingVertical: 8,
        paddingTop: 16,
    },
    statusIcon: {
        marginLeft: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 16,
    },
});

export default PremiumInput;
