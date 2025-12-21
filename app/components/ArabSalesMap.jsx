import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, {
    Path, G, Defs,
    LinearGradient, Stop,
    Circle,
    RadialGradient,
    Filter, FeDropShadow
} from 'react-native-svg';
import Animated, {
    FadeIn, FadeOut, FadeInDown,
    useSharedValue, useAnimatedStyle,
    withRepeat, withTiming, withSequence,
    Easing
} from 'react-native-reanimated';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 280;

// Arab Countries with improved paths and coordinates for markers
const COUNTRIES = {
    MA: { name: 'Morocco', path: "M 35,75 Q 45,70 55,73 Q 63,78 60,90 Q 52,100 40,95 Q 32,88 35,75", cx: 47, cy: 85, flag: '🇲🇦' },
    DZ: { name: 'Algeria', path: "M 55,73 Q 75,68 95,75 Q 105,95 90,115 Q 70,110 55,90 Q 50,80 55,73", cx: 75, cy: 90, flag: '🇩🇿' },
    TN: { name: 'Tunisia', path: "M 95,68 Q 102,65 108,72 Q 105,82 95,80 Q 92,75 95,68", cx: 100, cy: 73, flag: '🇹🇳' },
    LY: { name: 'Libya', path: "M 100,78 Q 135,75 140,95 Q 138,120 115,125 Q 95,118 98,95 Q 97,85 100,78", cx: 118, cy: 100, flag: '🇱🇾' },
    EG: { name: 'Egypt', path: "M 138,88 Q 165,85 168,105 Q 165,125 138,120 Q 135,105 138,88", cx: 152, cy: 105, flag: '🇪🇬' },
    SD: { name: 'Sudan', path: "M 138,122 Q 170,120 175,145 Q 168,170 140,165 Q 130,150 138,122", cx: 155, cy: 145, flag: '🇸🇩' },
    SA: { name: 'Saudi Arabia', path: "M 165,95 Q 205,88 225,115 Q 220,150 175,155 Q 155,130 165,95", cx: 190, cy: 120, flag: '🇸🇦' },
    YE: { name: 'Yemen', path: "M 175,155 Q 205,150 215,165 Q 205,180 175,175 Q 168,165 175,155", cx: 192, cy: 165, flag: '🇾🇪' },
    OM: { name: 'Oman', path: "M 220,115 Q 245,108 250,130 Q 242,155 218,150 Q 215,130 220,115", cx: 232, cy: 130, flag: '🇴🇲' },
    AE: { name: 'UAE', path: "M 218,108 Q 238,105 240,115 Q 235,125 218,118 Q 215,112 218,108", cx: 228, cy: 115, flag: '🇦🇪' },
    QA: { name: 'Qatar', path: "M 212,103 Q 220,100 222,108 Q 218,115 212,110 Q 210,106 212,103", cx: 216, cy: 107, flag: '🇶🇦' },
    KW: { name: 'Kuwait', path: "M 195,88 Q 205,85 208,92 Q 205,100 195,97 Q 192,92 195,88", cx: 200, cy: 92, flag: '🇰🇼' },
    IQ: { name: 'Iraq', path: "M 175,75 Q 200,68 210,85 Q 200,100 180,95 Q 168,88 175,75", cx: 190, cy: 85, flag: '🇮🇶' },
    SY: { name: 'Syria', path: "M 165,68 Q 185,62 192,78 Q 185,88 170,85 Q 160,78 165,68", cx: 178, cy: 75, flag: '🇸🇾' },
    JO: { name: 'Jordan', path: "M 160,85 Q 175,82 178,95 Q 172,105 158,100 Q 155,92 160,85", cx: 168, cy: 92, flag: '🇯🇴' },
    LB: { name: 'Lebanon', path: "M 162,78 Q 168,76 170,82 Q 167,88 162,85 Q 159,82 162,78", cx: 165, cy: 82, flag: '🇱🇧' },
    PS: { name: 'Palestine', path: "M 158,88 Q 163,86 165,92 Q 162,98 158,95 Q 155,92 158,88", cx: 160, cy: 92, flag: '🇵🇸' },
};

// Premium 3D Map Component
const ArabSalesMap = ({ data = {}, isDark = true }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Pulsing animation for markers
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.4);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, true
        );
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1500 }),
                withTiming(0.3, { duration: 1500 })
            ),
            -1, true
        );
    }, []);

    const animatedPulse = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: glowOpacity.value,
    }));

    // Get sales for a country
    const getSales = (code) => data[COUNTRIES[code]?.name] || 0;

    // Color based on sales intensity
    const getCountryColor = (code) => {
        const sales = getSales(code);
        if (!sales) return isDark ? 'rgba(50,50,50,0.6)' : 'rgba(200,200,200,0.4)';
        if (sales < 5) return isDark ? '#1E3A5F' : '#93C5FD';
        if (sales < 15) return isDark ? '#0D9488' : '#5EEAD4';
        if (sales < 30) return isDark ? '#059669' : '#34D399';
        return isDark ? '#10B981' : '#10B981';
    };

    // Get marker size based on sales
    const getMarkerSize = (code) => {
        const sales = getSales(code);
        if (!sales) return 0;
        if (sales < 5) return 6;
        if (sales < 15) return 9;
        if (sales < 30) return 12;
        return 15;
    };

    const handleCountryPress = (code) => {
        const country = COUNTRIES[code];
        if (selectedCountry?.code === code) {
            setSelectedCountry(null);
        } else {
            setSelectedCountry({
                code,
                ...country,
                sales: getSales(code),
                revenue: (getSales(code) * 45.5).toFixed(0) // Estimated revenue
            });
        }
    };

    const bgColor = isDark ? '#0A0A0A' : '#F5F5F5';
    const cardBg = isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)';
    const textColor = isDark ? '#FFF' : '#111';
    const borderColor = isDark ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.5)';

    return (
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
            {/* Premium Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <ExpoLinearGradient colors={['#D4AF37', '#B8860B']} style={styles.headerIcon}>
                        <Feather name="globe" size={18} color="#FFF" />
                    </ExpoLinearGradient>
                    <View>
                        <Text style={[styles.title, { color: textColor }]}>Sales Mapping</Text>
                        <Text style={[styles.subtitle, { color: isDark ? '#888' : '#666' }]}>Arab World Coverage</Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: isDark ? '#1E3A5F' : '#93C5FD' }]} />
                        <Text style={[styles.legendText, { color: isDark ? '#666' : '#888' }]}>Low</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.legendText, { color: isDark ? '#666' : '#888' }]}>High</Text>
                    </View>
                </View>
            </View>

            {/* 3D Map */}
            <View style={styles.mapWrapper}>
                {/* Background Glow */}
                <View style={[styles.mapGlow, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)' }]} />

                <Svg height={MAP_HEIGHT} width="100%" viewBox="0 0 280 220">
                    <Defs>
                        {/* 3D Shadow Gradient */}
                        <LinearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="rgba(0,0,0,0)" />
                            <Stop offset="1" stopColor="rgba(0,0,0,0.3)" />
                        </LinearGradient>

                        {/* Gold gradient for active countries */}
                        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#D4AF37" />
                            <Stop offset="1" stopColor="#B8860B" />
                        </LinearGradient>

                        {/* Glow for markers */}
                        <RadialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                            <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
                            <Stop offset="1" stopColor="#10B981" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Countries with 3D effect */}
                    <G>
                        {Object.entries(COUNTRIES).map(([code, country]) => (
                            <G key={code}>
                                {/* Shadow layer for 3D effect */}
                                <Path
                                    d={country.path}
                                    fill="rgba(0,0,0,0.2)"
                                    transform="translate(2, 3)"
                                />
                                {/* Main country */}
                                <Path
                                    d={country.path}
                                    fill={selectedCountry?.code === code ? 'url(#goldGrad)' : getCountryColor(code)}
                                    stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                                    strokeWidth="0.5"
                                    onPress={() => handleCountryPress(code)}
                                />
                            </G>
                        ))}
                    </G>

                    {/* Pulsing Markers for countries with sales */}
                    {Object.entries(COUNTRIES).map(([code, country]) => {
                        const size = getMarkerSize(code);
                        if (size === 0) return null;

                        return (
                            <G key={`marker-${code}`}>
                                {/* Outer glow */}
                                <Circle
                                    cx={country.cx}
                                    cy={country.cy}
                                    r={size + 4}
                                    fill="url(#markerGlow)"
                                    opacity={0.5}
                                />
                                {/* Inner marker */}
                                <Circle
                                    cx={country.cx}
                                    cy={country.cy}
                                    r={size / 2}
                                    fill="#10B981"
                                    stroke="#FFF"
                                    strokeWidth="1"
                                />
                            </G>
                        );
                    })}
                </Svg>

                {/* Selected Country Tooltip */}
                {selectedCountry && (
                    <Animated.View
                        entering={FadeIn.springify()}
                        exiting={FadeOut}
                        style={[styles.tooltip, { backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)' }]}
                    >
                        <View style={styles.tooltipHeader}>
                            <Text style={styles.tooltipFlag}>{selectedCountry.flag}</Text>
                            <Text style={[styles.tooltipName, { color: textColor }]}>{selectedCountry.name}</Text>
                        </View>
                        <View style={styles.tooltipStats}>
                            <View style={styles.tooltipStat}>
                                <Text style={[styles.tooltipLabel, { color: isDark ? '#888' : '#666' }]}>Orders</Text>
                                <Text style={[styles.tooltipValue, { color: '#10B981' }]}>{selectedCountry.sales}</Text>
                            </View>
                            <View style={[styles.tooltipDivider, { backgroundColor: isDark ? '#333' : '#DDD' }]} />
                            <View style={styles.tooltipStat}>
                                <Text style={[styles.tooltipLabel, { color: isDark ? '#888' : '#666' }]}>Revenue</Text>
                                <Text style={[styles.tooltipValue, { color: '#D4AF37' }]}>${selectedCountry.revenue}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* Stats Bar */}
            <View style={[styles.statsBar, { borderTopColor: isDark ? '#222' : '#EEE' }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#10B981' }]}>
                        {Object.values(COUNTRIES).reduce((sum, c) => sum + (data[c.name] || 0), 0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#666' : '#888' }]}>Total Orders</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#D4AF37' }]}>
                        {Object.keys(COUNTRIES).filter(k => getSales(k) > 0).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#666' : '#888' }]}>Active Countries</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#6366F1' }]}>
                        ${Object.values(COUNTRIES).reduce((sum, c) => sum + (data[c.name] || 0) * 45, 0).toFixed(0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDark ? '#666' : '#888' }]}>Est. Revenue</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        marginVertical: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    legend: {
        flexDirection: 'row',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
    },
    mapWrapper: {
        position: 'relative',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    mapGlow: {
        position: 'absolute',
        width: '80%',
        height: '60%',
        borderRadius: 100,
        top: '20%',
        left: '10%',
    },
    tooltip: {
        position: 'absolute',
        top: 15,
        right: 15,
        borderRadius: 16,
        padding: 14,
        minWidth: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    tooltipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tooltipFlag: {
        fontSize: 24,
    },
    tooltipName: {
        fontSize: 16,
        fontWeight: '700',
    },
    tooltipStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tooltipStat: {
        flex: 1,
        alignItems: 'center',
    },
    tooltipDivider: {
        width: 1,
        height: 30,
        marginHorizontal: 10,
    },
    tooltipLabel: {
        fontSize: 10,
        marginBottom: 4,
    },
    tooltipValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 14,
        borderTopWidth: 1,
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        marginTop: 4,
    },
});

export default ArabSalesMap;
