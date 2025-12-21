import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from "../../../src/context/AuthContext";
import { validateEmail } from "../../../src/utils/validation";
import { useTranslation } from "../../../src/hooks/useTranslation";

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const { sendOTP } = useAuth();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendCode = async () => {
        setError(null);

        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error);
            return;
        }

        setLoading(true);

        try {
            const result = await sendOTP(email);
            if (result.success) {
                Alert.alert(
                    "Email Sent",
                    `A verification code has been sent to ${email}. Please check your inbox.`,
                    [
                        {
                            text: "Enter Code",
                            onPress: () => router.push({
                                pathname: "/screens/auth/VerificationCodeScreen",
                                params: { email }
                            })
                        }
                    ]
                );
            }
        } catch (err) {
            // Check for Demo Mode Fallback (Missing Keys)
            if (err.message && err.message.startsWith("DEMO_MODE_KEYS_MISSING:")) {
                const demoCode = err.message.split(":")[1];
                Alert.alert(
                    "Setup Required",
                    "EmailJS keys are missing in src/services/emailService.js. Showing code for DEMO purposes:",
                    [
                        {
                            text: `Use Code: ${demoCode}`,
                            onPress: () => router.push({
                                pathname: "/screens/auth/VerificationCodeScreen",
                                params: { email }
                            })
                        }
                    ]
                );
            } else {
                Alert.alert("Error", err.message || "An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#000000', '#121212', '#1C1C1E']} // Premium Black Gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="key-outline" size={50} color="#D4AF37" />
                    </View>
                    <Text style={styles.title}>{t('forgotPassword') || 'Forgot Password'}</Text>
                    <Text style={styles.subtitle}>
                        {t('forgotPasswordSubtitle') || 'Enter your email to receive a reset link'}
                    </Text>
                </View>

                {/* Form Container */}
                <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.formContainer}>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <View style={[styles.inputWrapper, error && styles.inputError]}>
                            <Ionicons name="mail-outline" size={22} color="#fff" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setError(null);
                                }}
                                placeholder="your.email@example.com"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onSubmitEditing={handleSendCode}
                            />
                        </View>
                        {error && (
                            <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                                {error}
                            </Animated.Text>
                        )}
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSendCode}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.submitButtonText}>{t('sendCode') || 'Send Code'}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    header: {
        paddingTop: 80,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 40,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#D97706', // Gold/Orange Warning
    },
    errorText: {
        color: '#D97706',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#D4AF37', // Gold Button
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '700',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    cancelButton: {
        alignItems: 'center',
        padding: 10,
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    // Success State
    successContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10B981', // Success Green
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    successText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 30,
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
