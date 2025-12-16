import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Arab Countries SVG Paths (Simplified for Modern/Minimal Look)
// These are schematic paths representing the region
const ARAB_WOLRD_PATHS = {
    // North Africa
    MA: { name: 'Morocco', path: "M 40,80 L 50,75 L 60,78 L 65,90 L 50,100 L 40,95 Z" }, // Rough shape
    DZ: { name: 'Algeria', path: "M 60,78 L 90,75 L 100,100 L 80,120 L 65,90 Z" },
    TN: { name: 'Tunisia', path: "M 90,75 L 100,70 L 105,80 L 95,85 Z" },
    LY: { name: 'Libya', path: "M 95,85 L 130,85 L 130,125 L 100,120 L 100,100 Z" },
    EG: { name: 'Egypt', path: "M 130,90 L 160,90 L 160,115 L 130,115 Z" },
    SD: { name: 'Sudan', path: "M 130,115 L 160,115 L 160,150 L 130,160 Z" },
    MR: { name: 'Mauritania', path: "M 30,100 L 50,100 L 50,130 L 30,120 Z" },

    // Levant & Iraq
    IQ: { name: 'Iraq', path: "M 170,80 L 190,75 L 200,90 L 180,95 Z" },
    SY: { name: 'Syria', path: "M 160,80 L 175,80 L 175,90 L 165,90 Z" },
    LB: { name: 'Lebanon', path: "M 163,88 L 166,88 L 166,92 L 163,92 Z" },
    JO: { name: 'Jordan', path: "M 160,90 L 170,90 L 165,100 L 155,95 Z" },
    PS: { name: 'Palestine', path: "M 158,92 L 162,92 L 160,98 L 158,96 Z" },

    // Peninsula
    SA: { name: 'Saudi Arabia', path: "M 160,100 L 200,95 L 220,130 L 170,140 Z" },
    YE: { name: 'Yemen', path: "M 170,140 L 210,140 L 200,155 L 170,150 Z" },
    OM: { name: 'Oman', path: "M 220,130 L 240,125 L 235,145 L 210,140 Z" },
    AE: { name: 'UAE', path: "M 215,120 L 230,118 L 225,125 L 215,122 Z" },
    QA: { name: 'Qatar', path: "M 210,115 L 215,115 L 212,120 Z" },
    KW: { name: 'Kuwait', path: "M 195,95 L 200,95 L 198,100 Z" },
    BH: { name: 'Bahrain', path: "M 205,110 L 208,110 L 206,113 Z" },

    // Others
    SO: { name: 'Somalia', path: "M 170,160 L 200,160 L 180,190 Z" },
    DJ: { name: 'Djibouti', path: "M 165,155 L 170,155 L 168,160 Z" },
    KM: { name: 'Comoros', path: "M 200,200 L 205,200 L 202,205 Z" }, // Rough position
};

// Simplified path rendering for the demo. 
// Ideally, real GeoJSON paths would be used, but for "Minimal & Modern", stylized geometric shapes work well.

const ArabSalesMap = ({ data = {} }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Color Scale based on Sales (Pastel Greens)
    const getColor = (countryCode) => {
        const sales = data[ARAB_WOLRD_PATHS[countryCode]?.name] || 0;

        if (!sales) return '#F3F4F6'; // Default Grey (Empty)
        if (sales < 10) return '#D1FAE5'; // Low (Pastel Green 100)
        if (sales < 50) return '#6EE7B7'; // Medium (Pastel Green 300)
        if (sales < 100) return '#34D399'; // High (Pastel Green 400)
        return '#10B981'; // Top (Pastel Green 500)
    };

    const handlePress = (code) => {
        const countryName = ARAB_WOLRD_PATHS[code].name;
        if (selectedCountry?.code === code) {
            setSelectedCountry(null); // Deselect
        } else {
            setSelectedCountry({
                code,
                name: countryName,
                sales: data[countryName] || 0,
                orders: Math.floor((data[countryName] || 0) / 100) // Mock orders if not passed specifically
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sales Mapping – Arab Countries</Text>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#F3F4F6' }]} />
                        <Text style={styles.legendText}>Low</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>High</Text>
                    </View>
                </View>
            </View>

            {/* Map Area */}
            <View style={styles.mapContainer}>
                <Svg height="200" width="100%" viewBox="0 0 280 220">
                    <G>
                        {Object.keys(ARAB_WOLRD_PATHS).map((code) => (
                            <Path
                                key={code}
                                d={ARAB_WOLRD_PATHS[code].path}
                                fill={getColor(code)}
                                stroke="#FFF"
                                strokeWidth="1"
                                onPress={() => handlePress(code)}
                            />
                        ))}
                    </G>
                </Svg>

                {/* Tooltip Overlay */}
                {selectedCountry && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tooltip}>
                        <Text style={styles.tooltipTitle}>{selectedCountry.name}</Text>
                        <View style={styles.tooltipRow}>
                            <Text style={styles.tooltipLabel}>Sales:</Text>
                            <Text style={styles.tooltipValue}>{selectedCountry.sales}</Text>
                        </View>
                        <View style={styles.tooltipRow}>
                            <Text style={styles.tooltipLabel}>Orders:</Text>
                            <Text style={styles.tooltipValue}>{selectedCountry.orders}</Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    legend: {
        flexDirection: 'row',
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    mapContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 200,
    },
    tooltip: {
        position: 'absolute',
        top: 20, // Floating near top or could be dynamic x/y
        backgroundColor: 'rgba(31, 41, 55, 0.9)', // Dark Tooltip
        padding: 12,
        borderRadius: 12,
        zIndex: 10,
        minWidth: 120,
    },
    tooltipTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 4,
    },
    tooltipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    tooltipLabel: {
        color: '#D1D5DB',
        fontSize: 12,
    },
    tooltipValue: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default ArabSalesMap;
