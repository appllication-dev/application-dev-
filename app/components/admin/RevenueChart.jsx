import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { FadeIn, useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 60;
const CHART_HEIGHT = 120;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * RevenueChart - Premium animated area chart for revenue trends
 * Shows last 7 days of revenue with smooth animations
 */
const RevenueChart = ({ data = [], isDark = true, title = 'Revenue Trend' }) => {
    // Generate sample data if none provided
    const chartData = data.length > 0 ? data : [
        { day: 'Mon', value: 120 },
        { day: 'Tue', value: 180 },
        { day: 'Wed', value: 150 },
        { day: 'Thu', value: 280 },
        { day: 'Fri', value: 220 },
        { day: 'Sat', value: 350 },
        { day: 'Sun', value: 300 },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const minValue = Math.min(...chartData.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Calculate points for the curve
    const getX = (index) => (index / (chartData.length - 1)) * CHART_WIDTH;
    const getY = (value) => CHART_HEIGHT - ((value - minValue) / range) * (CHART_HEIGHT - 20) - 10;

    // Create smooth bezier curve path
    const createPath = () => {
        if (chartData.length < 2) return '';

        let path = `M ${getX(0)} ${getY(chartData[0].value)}`;

        for (let i = 1; i < chartData.length; i++) {
            const prevX = getX(i - 1);
            const prevY = getY(chartData[i - 1].value);
            const currX = getX(i);
            const currY = getY(chartData[i].value);

            // Control points for smooth curve
            const cpX = (prevX + currX) / 2;
            path += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
        }

        return path;
    };

    // Create filled area path
    const createAreaPath = () => {
        const linePath = createPath();
        if (!linePath) return '';

        return `${linePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
    };

    const linePath = createPath();
    const areaPath = createAreaPath();

    const bgColor = isDark ? '#1A1A1A' : '#FFF8E7';
    const textColor = isDark ? '#FFF' : '#333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <Animated.View entering={FadeIn.delay(300)} style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartContainer}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                        <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#10B981" stopOpacity="0.4" />
                            <Stop offset="1" stopColor="#10B981" stopOpacity="0" />
                        </LinearGradient>
                        <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#10B981" />
                            <Stop offset="1" stopColor="#34D399" />
                        </LinearGradient>
                    </Defs>

                    {/* Grid Lines */}
                    {[0, 1, 2, 3].map(i => (
                        <Path
                            key={i}
                            d={`M 0 ${(CHART_HEIGHT / 3) * i} L ${CHART_WIDTH} ${(CHART_HEIGHT / 3) * i}`}
                            stroke={gridColor}
                            strokeWidth="1"
                            strokeDasharray="5,5"
                        />
                    ))}

                    {/* Filled Area */}
                    <Path d={areaPath} fill="url(#areaGradient)" />

                    {/* Main Line */}
                    <Path
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {chartData.map((point, index) => (
                        <Circle
                            key={index}
                            cx={getX(index)}
                            cy={getY(point.value)}
                            r="5"
                            fill={isDark ? '#1A1A1A' : '#FFF'}
                            stroke="#10B981"
                            strokeWidth="2"
                        />
                    ))}
                </Svg>
            </View>

            {/* X-axis Labels */}
            <View style={styles.labelsContainer}>
                {chartData.map((point, index) => (
                    <Text key={index} style={[styles.label, { color: isDark ? '#888' : '#666' }]}>
                        {point.day}
                    </Text>
                ))}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? '#888' : '#666' }]}>Highest</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>${maxValue}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? '#888' : '#666' }]}>Average</Text>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        ${Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? '#888' : '#666' }]}>Growth</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>+12.5%</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        marginTop: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default RevenueChart;
