import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/context/ThemeContext';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';

const { width, height } = Dimensions.get('window');

const TrackingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Animation Values
    const driverProgress = useSharedValue(0);
    const pulse = useSharedValue(1);

    // Simulate Driver Movement
    useEffect(() => {
        // Driver moves from 0% to 80% over 10 seconds
        driverProgress.value = withTiming(0.8, {
            duration: 15000,
            easing: Easing.inOut(Easing.ease)
        });

        // Pulsing Destination
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    // Interpolate Driver Position along a curve
    const driverStyle = useAnimatedStyle(() => {
        // Simple linear interpolation for X and Y to simulate a path
        // In a real app, this would follow a GeoJSON path
        const progress = driverProgress.value;

        // Path logic: Starts top-left, curves to center, ends bottom-right
        const moveX = progress * (width - 60);
        const moveY = progress * (height * 0.4) + Math.sin(progress * Math.PI * 2) * 50;

        return {
            transform: [
                { translateX: moveX },
                { translateY: moveY },
                { scale: 1.2 } // Make driver prominent
            ]
        };
    });

    const destinationStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }]
    }));

    return (
        <View style={styles.container}>
            {/* Dark Map Background (Simulated with Gradient & Grid) */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={StyleSheet.absoluteFill}
                />
                {/* Grid Lines for Map Feel */}
                <View style={styles.gridContainer}>
                    {[...Array(10)].map((_, i) => (
                        <View key={`v-${i}`} style={[styles.gridLineV, { left: i * 50 }]} />
                    ))}
                    {[...Array(20)].map((_, i) => (
                        <View key={`h-${i}`} style={[styles.gridLineH, { top: i * 50 }]} />
                    ))}
                </View>

                {/* Path Line (Static for simulation) */}
                <View style={styles.pathLineContainer}>
                    <View style={styles.pathLine} />
                </View>
            </View>

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tracking Order #2891</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Map Area */}
                <View style={styles.mapArea}>

                    {/* Destination House */}
                    <Animated.View style={[styles.destination, destinationStyle]}>
                        <View style={styles.houseCircle}>
                            <Ionicons name="home" size={24} color="#FFF" />
                        </View>
                        <View style={styles.housePulse} />
                    </Animated.View>

                    {/* Moving Driver */}
                    <Animated.View style={[styles.driver, driverStyle]}>
                        <View style={styles.driverBubble}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3076/3076008.png' }}
                                style={{ width: 40, height: 40 }}
                            />
                        </View>
                        <Text style={styles.driverLabel}>Karim is on the way</Text>
                    </Animated.View>

                </View>

                {/* Bottom Sheet Status Card */}
                <BlurView intensity={30} tint="dark" style={styles.statusCard}>
                    <View style={styles.dragHandle} />

                    <View style={styles.timeRow}>
                        <View>
                            <Text style={styles.statusTitle}>Arriving in 12 min</Text>
                            <Text style={styles.statusSubtitle}>Latest arrival by 14:30</Text>
                        </View>
                        <View style={styles.progressCircle}>
                            <Text style={styles.timeText}>12</Text>
                            <Text style={styles.minText}>min</Text>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View style={styles.timeline}>
                        <View style={[styles.timelineItem, styles.activeTimeline]}>
                            <Ionicons name="checkmark-circle" size={16} color={RevolutionTheme.colors.gold} />
                            <Text style={styles.timelineText}>Order Confirmed</Text>
                        </View>
                        <View style={[styles.timelineLine, { backgroundColor: RevolutionTheme.colors.gold }]} />
                        <View style={[styles.timelineItem, styles.activeTimeline]}>
                            <Ionicons name="restaurant" size={16} color={RevolutionTheme.colors.gold} />
                            <Text style={styles.timelineText}>Kitchen</Text>
                        </View>
                        <View style={[styles.timelineLine, { backgroundColor: RevolutionTheme.colors.gold }]} />
                        <View style={[styles.timelineItem, styles.activeTimeline]}>
                            <FontAwesome5 name="shipping-fast" size={14} color={RevolutionTheme.colors.gold} />
                            <Text style={[styles.timelineText, { color: RevolutionTheme.colors.gold, fontWeight: 'bold' }]}>On Way</Text>
                        </View>
                    </View>

                    {/* Driver Info */}
                    <View style={styles.driverInfo}>
                        <View style={styles.driverProfile}>
                            <Image
                                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                style={styles.driverAvatar}
                            />
                            <View>
                                <Text style={styles.driverName}>Karim Ben</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={12} color={RevolutionTheme.colors.gold} />
                                    <Text style={styles.ratingText}>4.9 (Driver)</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.callButton}>
                                <Ionicons name="call" size={20} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.messageButton}>
                                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </BlurView>

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    gridContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
    gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#FFF' },
    gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#FFF' },
    pathLineContainer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    pathLine: { width: '80%', height: '40%', borderWidth: 2, borderColor: 'rgba(212, 175, 55, 0.3)', borderStyle: 'dotted', borderRadius: 100 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },

    mapArea: { flex: 1, position: 'relative' },
    destination: { position: 'absolute', bottom: 150, right: 40, alignItems: 'center' },
    houseCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: RevolutionTheme.colors.gold, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    housePulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212, 175, 55, 0.3)' },

    driver: { position: 'absolute', top: 50, left: 20, alignItems: 'center' },
    driverBubble: { padding: 5, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 25, borderWidth: 1, borderColor: RevolutionTheme.colors.gold },
    driverLabel: { color: '#FFF', fontSize: 10, marginTop: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, borderRadius: 4 },

    statusCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 25, paddingBottom: 40,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    dragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

    timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    statusTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
    statusSubtitle: { color: '#AAA', fontSize: 14, marginTop: 4 },
    progressCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: RevolutionTheme.colors.gold, justifyContent: 'center', alignItems: 'center' },
    timeText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    minText: { color: '#AAA', fontSize: 10 },

    timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    timelineItem: { alignItems: 'center', gap: 5 },
    timelineLine: { flex: 1, height: 2, marginHorizontal: 10, backgroundColor: '#333' },
    timelineText: { color: '#AAA', fontSize: 10 },

    driverInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 20 },
    driverProfile: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    driverAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#333' },
    driverName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    ratingText: { color: '#BBB', fontSize: 12 },

    actionButtons: { flexDirection: 'row', gap: 10 },
    callButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: RevolutionTheme.colors.gold, justifyContent: 'center', alignItems: 'center' },
    messageButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
});

export default TrackingScreen;
