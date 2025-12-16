import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '../../src/context/SettingsContext';
import { useTranslation } from '../../src/hooks/useTranslation';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Discover Trends',
        description: 'Explore the latest fashion trends and find your unique style with our curated collection.',
        icon: 'shirt-outline',
        color: '#D4AF37' // Gold
    },
    {
        id: '2',
        title: 'Easy Shopping',
        description: 'Experience seamless shopping with our intuitive interface and secure checkout process.',
        icon: 'cart-outline',
        color: '#C0C0C0' // Silver
    },
    {
        id: '3',
        title: 'Fast Delivery',
        description: 'Get your favorite items delivered to your doorstep in record time. We value your time.',
        icon: 'rocket-outline',
        color: '#D97706' // Bronze/Orange
    }
];

const OnboardingScreen = () => {
    const router = useRouter();
    const { completeOnboarding } = useSettings();
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const slides = [
        {
            id: '1',
            title: t('onboardingTitle1'),
            description: t('onboardingDesc1'),
            icon: 'shirt-outline',
            color: '#D4AF37'
        },
        {
            id: '2',
            title: t('onboardingTitle2'),
            description: t('onboardingDesc2'),
            icon: 'cart-outline',
            color: '#C0C0C0'
        },
        {
            id: '3',
            title: t('onboardingTitle3'),
            description: t('onboardingDesc3'),
            icon: 'rocket-outline',
            color: '#D97706'
        }
    ];

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = async () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await completeOnboarding();
            router.replace('/(tabs)');
        }
    };

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const Paginator = ({ data, scrollX }) => {
        return (
            <View style={styles.paginatorContainer}>
                {data.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 20, 10],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            style={[styles.dot, { width: dotWidth, opacity }]}
                            key={i.toString()}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Gradient */}
            {/* Background Gradient - Pure Luxury Black */}
            <LinearGradient
                colors={['#000000', '#121212', '#1C1C1E']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative Circles */}
            <View style={[styles.circle, { top: -100, right: -100, width: 300, height: 300, backgroundColor: 'rgba(212,175,55, 0.15)' }]} />
            <View style={[styles.circle, { bottom: -50, left: -50, width: 200, height: 200, backgroundColor: 'rgba(192,192,192, 0.1)' }]} />

            <View style={{ flex: 3 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => (
                        <View style={styles.slide}>
                            <View style={styles.iconContainer}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                                    style={styles.iconCircle}
                                >
                                    <Ionicons name={item.icon} size={80} color="#D4AF37" />
                                </LinearGradient>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View style={styles.footer}>
                <Paginator data={slides} scrollX={scrollX} />

                <TouchableOpacity
                    style={styles.button}
                    onPress={scrollTo}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#D4AF37', '#B8860B']} // Rich Gold Gradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={[styles.buttonText, { color: '#000000' }]}>
                            {currentIndex === slides.length - 1 ? t('getStarted') : t('next')}
                        </Text>
                        <Ionicons
                            name={currentIndex === slides.length - 1 ? "rocket-outline" : "arrow-forward"}
                            size={20}
                            color="#0B1121"
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#D4AF37', // Gold Title
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(212, 175, 55, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    description: {
        fontSize: 16,
        color: '#E0E0E0', // Off-white for better readability against black
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    paginatorContainer: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginHorizontal: 8,
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        flexDirection: 'row',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default OnboardingScreen;
