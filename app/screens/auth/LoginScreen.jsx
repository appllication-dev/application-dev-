import React, { useState, useRef } from "react";
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
import { useRouter, useNavigation } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from "../../../src/context/AuthContext";
import { validateEmail, validatePassword } from "../../../src/utils/validation";
import { rateLimiters, sanitizeEmail, cleanInput } from "../../../src/utils/security";
import { handleError, ERROR_TYPES } from "../../../src/utils/errorHandler";
import { useTranslation } from "../../../src/hooks/useTranslation";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const { login, loginWithGoogle } = useAuth();
    const { t } = useTranslation();

    // Helper for navigation
    const handleAuthNavigation = () => {
        router.replace('/(tabs)');
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginAttempts, setLoginAttempts] = useState(0);

    const passwordRef = useRef(null);


    // Google Auth Request
    const redirectUri = makeRedirectUri({
        useProxy: true
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: '1076765269610-u5to0vkmrfc2b82f8hvjbg6jfaog3oom.apps.googleusercontent.com',
        redirectUri: redirectUri,
    });

    const handleGoogleLogin = () => {
        // DEBUG: Verify the URI generated.
        // If correct (after eas init), it should be https://auth.expo.io/@owner/slug
        Alert.alert(
            "Debug Mode",
            `Redirect URI: ${redirectUri}\n\nPlease verify this matches Google Console.`,
            [
                { text: "Continue", onPress: () => promptAsync() }
            ]
        );
    };

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token);
        }
    }, [response]);

    const handleGoogleSignIn = async (idToken) => {
        if (idToken) {
            setLoading(true);
            try {
                const result = await loginWithGoogle(idToken);
                if (result.success) {
                    handleAuthNavigation();
                }
            } catch (error) {
                Alert.alert("Google Sign-In Error", error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Validate inputs
    const validateInputs = () => {
        const newErrors = {};

        const emailResult = validateEmail(email);
        if (!emailResult.isValid) {
            newErrors.email = emailResult.error;
        }

        const passwordResult = validatePassword(password);
        if (!passwordResult.isValid) {
            newErrors.password = passwordResult.error;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        // Check rate limiting
        if (!rateLimiters.login.isAllowed('login_attempt')) {
            const waitTime = Math.ceil(rateLimiters.login.getTimeUntilReset('login_attempt') / 1000);
            Alert.alert(
                "Too Many Attempts",
                `Please wait ${waitTime} seconds before trying again.`
            );
            return;
        }

        // Validate inputs
        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            // Sanitize inputs
            const sanitizedEmail = sanitizeEmail(email);
            const cleanedPassword = cleanInput(password);

            // Timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("LOGIN_TIMEOUT"));
                }, 15000);
            });

            // Race Login
            const success = await Promise.race([
                login(sanitizedEmail, cleanedPassword),
                timeoutPromise
            ]);

            if (success) {
                rateLimiters.login.reset('login_attempt');
                setLoginAttempts(0);
                setLoading(false);
                handleAuthNavigation();
            } else {
                setLoginAttempts(prev => prev + 1);
                Alert.alert(
                    "Login Failed",
                    `Invalid email or password. ${3 - loginAttempts - 1} attempts remaining.`
                );
            }
        } catch (error) {
            console.error("💥 [Login] Error:", error);
            if (error.message === "LOGIN_TIMEOUT") {
                Alert.alert("Connection Timeout", "Login took too long.");
            } else {
                handleError(error, {
                    context: 'LoginScreen',
                    onAuthError: () => Alert.alert("Authentication Error", "Check credentials."),
                    onNetworkError: () => Alert.alert("Connection Error", "Check internet."),
                    onError: () => Alert.alert("Error", "Unexpected error occurred.")
                });
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
                        <Ionicons name="storefront" size={50} color="#D4AF37" />
                    </View>
                    <Text style={styles.title}>{t('welcome')}</Text>
                    <Text style={styles.subtitle}>{t('login')}</Text>
                </View>

                {/* Form Container */}
                <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                            <Ionicons name="mail-outline" size={22} color="#fff" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                                }}
                                placeholder="your.email@example.com"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                            />
                        </View>
                        {errors.email && (
                            <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                                {errors.email}
                            </Animated.Text>
                        )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('password')}</Text>
                        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={22} color="#fff" style={styles.inputIcon} />
                            <TextInput
                                ref={passwordRef}
                                style={styles.input}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                                }}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                secureTextEntry={!showPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={22}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorText}>
                                {errors.password}
                            </Animated.Text>
                        )}
                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            onPress={() => router.push("/screens/auth/ForgotPasswordScreen")}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>{t('forgotPassword') || 'Forgot Password?'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#0B1121" />
                        ) : (
                            <Text style={styles.loginButtonText}>{t('login')}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Google Login Button */}
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Or sign in with</Text>
                        <TouchableOpacity
                            onPress={handleGoogleLogin}
                            disabled={!request}
                            style={styles.googleButton}
                        >
                            <Ionicons name="logo-google" size={20} color="black" style={{ marginRight: 10 }} />
                            <Text style={styles.googleButtonText}>Sign in with Google</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>{t('dontHaveAccount')} </Text>
                        <TouchableOpacity onPress={() => router.replace("/screens/auth/RegisterScreen")}>
                            <Text style={styles.registerLink}>{t('createAccount')}</Text>
                        </TouchableOpacity>
                    </View>
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
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 40,
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
        marginBottom: 20,
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
    loginButton: {
        backgroundColor: '#D4AF37', // Gold Button
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    loginButtonText: {
        color: '#000000', // Black text on Gold button
        fontSize: 18,
        fontWeight: '700',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    registerLink: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#D97706', // Gold/Orange Warning
    },
    errorText: {
        color: '#D97706', // Gold/Orange Warning
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        color: '#D4AF37', // Gold
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
        width: '100%',
        maxWidth: 280,
    },
    googleButtonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default LoginScreen;
