import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SIZE = width * 0.45;
const RADIUS = SIZE / 2 - 20;
const CENTER = SIZE / 2;

/**
 * CategoryPieChart - Interactive donut chart for category distribution
 * Shows sales distribution by product category
 */
const CategoryPieChart = ({ data = [], isDark = true, title = 'Sales by Category' }) => {
    // Default data if none provided
    const chartData = data.length > 0 ? data : [
        { name: 'T-shirts', value: 45, color: '#10B981' },
        { name: 'Hoodies', value: 30, color: '#6366F1' },
        { name: 'Hats', value: 15, color: '#F59E0B' },
        { name: 'Others', value: 10, color: '#EC4899' },
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Calculate pie segments
    const calculateSegments = () => {
        let startAngle = -90; // Start from top
        return chartData.map(item => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const segment = {
                ...item,
                startAngle,
                endAngle: startAngle + angle,
                percentage: (percentage * 100).toFixed(1),
            };
            startAngle += angle;
            return segment;
        });
    };

    const segments = calculateSegments();

    // Create arc path for a segment (donut style)
    const createArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;

        const x1 = CENTER + outerRadius * Math.cos(startRadians);
        const y1 = CENTER + outerRadius * Math.sin(startRadians);
        const x2 = CENTER + outerRadius * Math.cos(endRadians);
        const y2 = CENTER + outerRadius * Math.sin(endRadians);
        const x3 = CENTER + innerRadius * Math.cos(endRadians);
        const y3 = CENTER + innerRadius * Math.sin(endRadians);
        const x4 = CENTER + innerRadius * Math.cos(startRadians);
        const y4 = CENTER + innerRadius * Math.sin(startRadians);

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `
            M ${x1} ${y1}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z
        `;
    };

    const bgColor = isDark ? '#1A1A1A' : '#FFF8E7';
    const textColor = isDark ? '#FFF' : '#333';

    return (
        <Animated.View entering={FadeIn.delay(400)} style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartRow}>
                {/* Donut Chart */}
                <View style={styles.chartContainer}>
                    <Svg width={SIZE} height={SIZE}>
                        <G>
                            {segments.map((segment, index) => (
                                <Path
                                    key={index}
                                    d={createArcPath(segment.startAngle, segment.endAngle, RADIUS * 0.6, RADIUS)}
                                    fill={segment.color}
                                />
                            ))}
                            {/* Center Circle */}
                            <Circle
                                cx={CENTER}
                                cy={CENTER}
                                r={RADIUS * 0.55}
                                fill={bgColor}
                            />
                            {/* Center Text */}
                            <SvgText
                                x={CENTER}
                                y={CENTER - 5}
                                textAnchor="middle"
                                fill={textColor}
                                fontSize="24"
                                fontWeight="bold"
                            >
                                {total}
                            </SvgText>
                            <SvgText
                                x={CENTER}
                                y={CENTER + 15}
                                textAnchor="middle"
                                fill={isDark ? '#888' : '#666'}
                                fontSize="11"
                            >
                                Total Sales
                            </SvgText>
                        </G>
                    </Svg>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    {segments.map((segment, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                            <View style={styles.legendText}>
                                <Text style={[styles.legendName, { color: textColor }]}>{segment.name}</Text>
                                <Text style={[styles.legendValue, { color: isDark ? '#888' : '#666' }]}>
                                    {segment.percentage}%
                                </Text>
                            </View>
                        </View>
                    ))}
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
        marginBottom: 8,
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartContainer: {
        flex: 1,
    },
    legend: {
        flex: 1,
        paddingLeft: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    legendText: {
        flex: 1,
    },
    legendName: {
        fontSize: 13,
        fontWeight: '600',
    },
    legendValue: {
        fontSize: 11,
        marginTop: 2,
    },
});

export default CategoryPieChart;
