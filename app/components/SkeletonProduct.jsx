import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const SkeletonProduct = () => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.textLine, { width: '80%', opacity }]} />
                <Animated.View style={[styles.textLine, { width: '50%', marginTop: 8, opacity }]} />
                <View style={styles.footer}>
                    <Animated.View style={[styles.pricePlaceholder, { opacity }]} />
                    <Animated.View style={[styles.buttonPlaceholder, { opacity }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imagePlaceholder: {
        width: '100%',
        height: 160,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        padding: 12,
    },
    textLine: {
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    pricePlaceholder: {
        width: 40,
        height: 16,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    buttonPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});

export default SkeletonProduct;
