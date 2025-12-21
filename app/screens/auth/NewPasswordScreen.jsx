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
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from "../../../src/context/AuthContext";
import { useTranslation } from "../../../src/hooks/useTranslation";
import { validatePassword, validatePasswordMatch } from "../../../src/utils/validation";

const NewPasswordScreen = () => {
    const router = useRouter();
    const { email, token } = useLocalSearchParams();
    const { resetPasswordViaOTP } = useAuth();
    const { t } = useTranslation();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const passCheck = validatePassword(password);
        if (!passCheck.isValid) {
            Alert.alert("Weak Password", passCheck.error);
            return;
        }

        const matchCheck = validatePasswordMatch(password, confirmPassword);
        if (!matchCheck.isValid) {
            Alert.alert("Error", matchCheck.error);
            return;
        }

        setLoading(true);
        try {
            const result = await resetPasswordViaOTP(email, token, password);
            if (result.success) {
                Alert.alert(
                    "Success",
                    "Your password has been reset successfully!",
                    [
                        { text: "Login Now", onPress: () => router.replace("/screens/auth/LoginScreen") }
                    ]
                );
            }
        } catch (error) {
            Alert.alert("Error", error.message);
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
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="lock-closed-outline" size={40} color="#D4AF37" />
                    </View>
                    <Text style={styles.title}>{t('resetPassword') || "Reset Password"}</Text>
                    <Text style={styles.subtitle}>{t('enterNewPassword') || "Enter your new password below"}</Text>
                </View>

                <Animated.View entering={FadeInUp.duration(500)} style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('newPassword') || "New Password"}
                            placeholderTextColor="#666"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('confirmPassword') || "Confirm Password"}
                            placeholderTextColor="#666"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>{t('reset') || "Reset Password"}</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24 },
    backButton: { marginTop: 10, marginBottom: 20 },
    header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20
    },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#ccc' },
    form: { width: '100%' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12, paddingHorizontal: 15,
        height: 56, marginBottom: 20
    },
    input: { flex: 1, color: '#fff', fontSize: 16 },
    button: {
        backgroundColor: '#D4AF37', borderRadius: 16, height: 56,
        alignItems: 'center', justifyContent: 'center', marginTop: 10
    },
    buttonText: { fontSize: 18, color: '#000', fontWeight: 'bold' }
});

export default NewPasswordScreen;
