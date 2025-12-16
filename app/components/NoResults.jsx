import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { FadeIn } from 'react-native-reanimated';

const NoResults = ({ searchQuery }) => {
    const { colors } = useTheme();

    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                <Feather name="search" size={60} color={colors.primary} style={{ opacity: 0.8 }} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>No Results Found</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {searchQuery
                    ? `We couldn't find any products matching "${searchQuery}"`
                    : "Try different keywords or filters"}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NoResults;
