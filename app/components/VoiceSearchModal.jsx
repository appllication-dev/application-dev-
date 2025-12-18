import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';
import { useRouter } from 'expo-router';
// Using Mock service now due to environment constraints
import { startRecording, stopRecording, mockSpeechToText, speak, requestPermissions } from '../../src/services/speechService';

const VoiceSearchModal = ({ visible, onClose, onSearch }) => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();

    // Voice State
    const [recognizing, setRecognizing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("init"); // init, listening, processing, success, error

    // Animations
    const pulse1 = useSharedValue(1);
    const pulse2 = useSharedValue(1);
    const pulse3 = useSharedValue(1);
    const opacity1 = useSharedValue(0.2);
    const opacity2 = useSharedValue(0.2);
    const opacity3 = useSharedValue(0.2);

    useEffect(() => {
        if (visible) {
            handleStartListening();
            startPulseAnimations();
        } else {
            handleStopListening();
            resetAnimations();
            setTranscript("");
            setStatus("init");
            setError(null);
        }
    }, [visible]);

    const handleStartListening = async () => {
        setStatus("listening");
        setRecognizing(true);
        setError(null);

        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            setError("Microphone permission denied");
            setStatus("error");
            setRecognizing(false);
            return;
        }

        const started = await startRecording();
        if (!started) {
            setError("Failed to start recording");
            setStatus("error");
            setRecognizing(false);
            return;
        }

        // Auto-stop after 4 seconds (simulation logic)
        setTimeout(() => {
            if (visible) handleStopListening();
        }, 4000);
    };

    const handleStopListening = async () => {
        if (!recognizing) return;

        setRecognizing(false);
        setStatus("processing");
        await stopRecording();

        try {
            // Get Mock Result (Simulation)
            const result = await mockSpeechToText('ar-MA');
            setTranscript(result.transcript);

            // Success Feedback
            setStatus("success");
            speak(`Searching for ${result.transcript}`);

            // Action
            handleCommand(result.transcript);
        } catch (err) {
            setError("Failed to recognize speech");
            setStatus("error");
        }
    };

    const handleCommand = (text) => {
        const cmd = text.toLowerCase().trim();

        // Wait a beat so user sees what they said
        setTimeout(() => {
            onClose();
            // Arabic & English Command Mapping
            if (cmd.includes('cart') || cmd.includes('basket') || cmd.includes('سلة') || cmd.includes('السلة') || cmd.includes('panier')) {
                router.push('/Basket');
            } else if (cmd.includes('home') || cmd.includes('رئيسية') || cmd.includes('دار') || cmd.includes('الدار')) {
                router.push('/');
            } else if (cmd.includes('admin') || cmd.includes('أدمن') || cmd.includes('مدير')) {
                router.push('/admin');
            } else {
                console.log("Searching for:", cmd);
                if (onSearch) {
                    onSearch(cmd);
                } else {
                    router.push({ pathname: '/(tabs)', params: { search: cmd } });
                }
            }
        }, 1500);
    };

    const startPulseAnimations = () => {
        const config = { duration: 2000, easing: Easing.out(Easing.ease) };
        pulse1.value = withRepeat(withTiming(3, config), -1, false);
        opacity1.value = withRepeat(withSequence(withTiming(0, config), withTiming(0.2, { duration: 0 })), -1, false);
        setTimeout(() => {
            pulse2.value = withRepeat(withTiming(3, config), -1, false);
            opacity2.value = withRepeat(withSequence(withTiming(0, config), withTiming(0.2, { duration: 0 })), -1, false);
        }, 600);
        setTimeout(() => {
            pulse3.value = withRepeat(withTiming(3, config), -1, false);
            opacity3.value = withRepeat(withSequence(withTiming(0, config), withTiming(0.2, { duration: 0 })), -1, false);
        }, 1200);
    };

    const resetAnimations = () => {
        pulse1.value = 1; pulse2.value = 1; pulse3.value = 1;
        opacity1.value = 0.2; opacity2.value = 0.2; opacity3.value = 0.2;
    };

    const animatedStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: pulse1.value }], opacity: opacity1.value }));
    const animatedStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: pulse2.value }], opacity: opacity2.value }));
    const animatedStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: pulse3.value }], opacity: opacity3.value }));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={isDark ? 50 : 30} tint={isDark ? "dark" : "light"} style={styles.container}>
                <View style={[styles.content]}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: isDark ? RevolutionTheme.colors.gold : RevolutionTheme.colors.primary }]}>
                        {status === 'listening' ? "Listening..." :
                            status === 'processing' ? "Processing..." :
                                status === 'success' ? "Found it!" : "Speak Now"}
                    </Text>

                    <View style={styles.micContainer}>
                        {/* Pulsing Waves */}
                        {status === 'listening' && (
                            <>
                                <Animated.View style={[styles.wave, { borderColor: RevolutionTheme.colors.gold }, animatedStyle1]} />
                                <Animated.View style={[styles.wave, { borderColor: RevolutionTheme.colors.gold }, animatedStyle2]} />
                                <Animated.View style={[styles.wave, { borderColor: RevolutionTheme.colors.gold }, animatedStyle3]} />
                            </>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={status === 'listening' ? handleStopListening : handleStartListening}
                            style={[styles.micCircle, { backgroundColor: isDark ? '#000' : '#FFF' }]}
                        >
                            <Ionicons
                                name={status === 'success' ? "checkmark" : "mic"}
                                size={40}
                                color={RevolutionTheme.colors.gold}
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.transcript, { color: isDark ? '#FFF' : '#000' }]}>
                        {transcript || (error ? `Error: ${error}` : "")}
                    </Text>

                    {status === 'processing' && (
                        <Text style={[styles.subText, { color: isDark ? '#AAA' : '#666' }]}>
                            Analyzing voice...
                        </Text>
                    )}
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 60,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
    },
    micContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    micCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    wave: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#D4AF37'
    },
    transcript: {
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 40,
        minHeight: 60,
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
    },
    subText: {
        marginTop: 10,
        fontSize: 14,
    },
    closeButton: {
        position: 'absolute',
        top: -150,
        right: 30,
        padding: 10,
    }
});

export default VoiceSearchModal;
