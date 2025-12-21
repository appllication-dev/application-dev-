import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from "../../../src/context/AuthContext";
import { useTranslation } from "../../../src/hooks/useTranslation";

const VerificationCodeScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const { verifyOTP, sendOTP } = useAuth();
    const { t } = useTranslation();

    const [code, setCode] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        if (text.length > 1) {
            // Paste logic could go here
            const pasted = text.split("");
            for (let i = 0; i < 4; i++) {
                if (indices + i < 4 && pasted[i]) {
                    newCode[index + i] = pasted[i];
                }
            }
        } else {
            newCode[index] = text;
        }

        setCode(newCode);

        // Auto focus next input
        if (text && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (text, index) => {
        if (!text && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length !== 4) {
            Alert.alert("Error", "Please enter the full 4-digit code");
            return;
        }

        setLoading(true);
        try {
            const result = await verifyOTP(email, fullCode);
            if (result.success) {
                router.push({
                    pathname: "/screens/auth/NewPasswordScreen",
                    params: { email, token: result.token }
                });
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await sendOTP(email);
            setTimer(60);
            Alert.alert("Sent", "A new code has been sent!");
        } catch (error) {
            Alert.alert("Error", "Failed to resend code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#000000', '#121212', '#1C1C1E']} // Premium Black Gradient
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="chatbox-ellipses-outline" size={40} color="#D4AF37" />
                    </View>
                    <Text style={styles.title}>{t('verificationCode') || 'OTP Verification'}</Text>
                    <Text style={styles.subtitle}>
                        {t('enterCodeText') || `Enter the 4-digit code sent to ${email}`}
                    </Text>
                </View>

                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => inputRefs.current[index] = ref}
                            style={[
                                styles.codeInput,
                                digit ? styles.codeInputFilled : null
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    handleBackspace(digit, index);
                                }
                            }}
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.verifyButtonText}>{t('verify') || 'Verify'}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        {t('didntReceiveCode') || "Didn't receive code?"}{" "}
                    </Text>
                    <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                        <Text style={[styles.resendLink, timer > 0 && { color: 'gray' }]}>
                            {timer > 0 ? `Resend in ${timer}s` : (t('resend') || "Resend")}
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24 },
    backButton: { marginTop: 10, alignSelf: 'flex-start' },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20
    },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#ccc', textAlign: 'center', paddingHorizontal: 20 },
    codeContainer: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40,
        paddingHorizontal: 20
    },
    codeInput: {
        width: 60, height: 60, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff', fontSize: 24, fontWeight: 'bold',
        textAlign: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    codeInputFilled: {
        borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.1)'
    },
    verifyButton: {
        backgroundColor: '#D4AF37', borderRadius: 16, height: 56,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20
    },
    verifyButtonText: { fontSize: 18, color: '#000', fontWeight: 'bold' },
    resendContainer: { flexDirection: 'row', justifyContent: 'center' },
    resendText: { color: '#888' },
    resendLink: { color: '#D4AF37', fontWeight: 'bold' }
});

export default VerificationCodeScreen;
