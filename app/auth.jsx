import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { BlurView } from "expo-blur";
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

import { useTranslation } from "./hooks/useTranslation";

export default function AuthScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { login, signup } = useAuth();
    const { t } = useTranslation();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    // Focus states for glowing inputs
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && (!name || !phone))) {
            return;
        }

        setLoading(true);
        try {
            const userData = {
                email: email.trim().toLowerCase(),
                displayName: name || email.split("@")[0],
                phone: phone,
                photoURL: null,
                id: Date.now().toString(),
                uid: `local_${Date.now().toString()}`, // For Firebase compatibility
            };

            if (isLogin) {
                await login(userData);
            } else {
                await signup(userData);
            }
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#0A0A12" : "#F8F8FF" }]}>
            {/* Dynamic Background Glows */}
            <View style={[styles.bgGlow1, { backgroundColor: theme.primary + "20" }]} />
            <View style={[styles.bgGlow2, { backgroundColor: theme.accent + "15" }]} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
                        style={styles.backBtn}
                    >
                        <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={styles.backBtnBlur}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </BlurView>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.logoSlot}>
                            <LinearGradient colors={[theme.primary, theme.accent]} style={styles.logoCircle}>
                                <Ionicons name="sparkles" size={40} color="#FFF" />
                            </LinearGradient>
                            <Text style={[styles.brandText, { color: theme.text }]}>KATARAA</Text>
                            <Text style={[styles.tagline, { color: theme.textMuted }]}>
                                {isLogin ? t('taglineLogin') : t('taglineRegister')}
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.formSlot}>
                            <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.glassCard}>
                                <Text style={[styles.formTitle, { color: theme.text }]}>
                                    {isLogin ? t('signIn') : t('createAccount')}
                                </Text>

                                {!isLogin && (
                                    <View style={styles.inputBox}>
                                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>{t('fullName')}</Text>
                                        <View style={[styles.inputWrapper, focusedField === "name" && { borderColor: theme.primary, backgroundColor: theme.primary + "05" }]}>
                                            <Ionicons name="person-outline" size={20} color={focusedField === "name" ? theme.primary : theme.textMuted} />
                                            <TextInput
                                                onFocus={() => setFocusedField("name")}
                                                onBlur={() => setFocusedField(null)}
                                                style={[styles.input, { color: theme.text }]}
                                                placeholder={t('placeholderName')}
                                                placeholderTextColor={theme.textMuted + "80"}
                                                value={name}
                                                onChangeText={setName}
                                            />
                                        </View>
                                    </View>
                                )}

                                <View style={styles.inputBox}>
                                    <Text style={[styles.inputLabel, { color: theme.textMuted }]}>{t('email')}</Text>
                                    <View style={[styles.inputWrapper, focusedField === "email" && { borderColor: theme.primary, backgroundColor: theme.primary + "05" }]}>
                                        <Ionicons name="mail-outline" size={20} color={focusedField === "email" ? theme.primary : theme.textMuted} />
                                        <TextInput
                                            onFocus={() => setFocusedField("email")}
                                            onBlur={() => setFocusedField(null)}
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder={t('placeholderEmail')}
                                            placeholderTextColor={theme.textMuted + "80"}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {!isLogin && (
                                    <View style={styles.inputBox}>
                                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>{t('phone')}</Text>
                                        <View style={[styles.inputWrapper, focusedField === "phone" && { borderColor: theme.primary, backgroundColor: theme.primary + "05" }]}>
                                            <Ionicons name="call-outline" size={20} color={focusedField === "phone" ? theme.primary : theme.textMuted} />
                                            <TextInput
                                                onFocus={() => setFocusedField("phone")}
                                                onBlur={() => setFocusedField(null)}
                                                style={[styles.input, { color: theme.text }]}
                                                placeholder={t('placeholderPhone')}
                                                placeholderTextColor={theme.textMuted + "80"}
                                                value={phone}
                                                onChangeText={setPhone}
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>
                                )}

                                <View style={styles.inputBox}>
                                    <Text style={[styles.inputLabel, { color: theme.textMuted }]}>{t('password')}</Text>
                                    <View style={[styles.inputWrapper, focusedField === "pass" && { borderColor: theme.primary, backgroundColor: theme.primary + "05" }]}>
                                        <Ionicons name="lock-closed-outline" size={20} color={focusedField === "pass" ? theme.primary : theme.textMuted} />
                                        <TextInput
                                            onFocus={() => setFocusedField("pass")}
                                            onBlur={() => setFocusedField(null)}
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder={t('placeholderPass')}
                                            placeholderTextColor={theme.textMuted + "80"}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                {isLogin && (
                                    <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/forgot-password')}>
                                        <Text style={[styles.forgotText, { color: theme.primary }]}>{t('forgotPassword')}</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                                    <LinearGradient
                                        colors={[theme.primary, theme.primaryDark]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.submitGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <Text style={styles.submitText}>{isLogin ? t('signIn') : t('createAccount')}</Text>
                                                <Ionicons name="chevron-forward" size={20} color="#FFF" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.switchSlot}>
                                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                        <Text style={[styles.switchText, { color: theme.textMuted }]}>
                                            {isLogin ? t('noAccount') : t('hasAccount')}
                                            <Text style={[styles.switchLink, { color: theme.primary }]}>
                                                {isLogin ? t('joinNow') : t('loginLink')}
                                            </Text>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>

                        <View style={styles.socialSlot}>
                            <Text style={[styles.socialTitle, { color: theme.textMuted }]}>{t('orContinue')}</Text>
                            <View style={styles.socialRow}>
                                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: isDark ? "#1A1A2E" : "#FFF" }]}>
                                    <Ionicons name="logo-google" size={24} color="#EA4335" />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: isDark ? "#1A1A2E" : "#FFF" }]}>
                                    <Ionicons name="logo-apple" size={24} color={isDark ? "#FFF" : "#000"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: isDark ? "#1A1A2E" : "#FFF" }]}>
                                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGlow1: { position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: 200, zIndex: -1 },
    bgGlow2: { position: "absolute", bottom: -100, right: -100, width: 350, height: 350, borderRadius: 175, zIndex: -1 },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 10 },
    backBtn: { width: 50, height: 50, borderRadius: 25, overflow: "hidden", elevation: 5 },
    backBtnBlur: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { paddingBottom: 60 },

    logoSlot: { alignItems: "center", marginTop: 20, marginBottom: 30 },
    logoCircle: { width: 100, height: 100, borderRadius: 35, justifyContent: "center", alignItems: "center", elevation: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
    brandText: { fontSize: 32, fontWeight: "900", letterSpacing: 8, marginTop: 20 },
    tagline: { fontSize: 16, fontWeight: "500", marginTop: 5, letterSpacing: 1 },

    formSlot: { paddingHorizontal: 20 },
    glassCard: { padding: 30, borderRadius: 45, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
    formTitle: { fontSize: 24, fontWeight: "800", marginBottom: 25, textAlign: "center" },

    inputBox: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: "700", marginLeft: 5, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
    inputWrapper: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, height: 60, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)", gap: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: "600" },

    forgotBtn: { alignSelf: "flex-end", marginBottom: 25 },
    forgotText: { fontSize: 14, fontWeight: "700" },

    submitBtn: { height: 65, borderRadius: 24, overflow: "hidden", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
    submitGradient: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
    submitText: { color: "#FFF", fontSize: 18, fontWeight: "900" },

    switchSlot: { marginTop: 25, alignItems: "center" },
    switchText: { fontSize: 15, fontWeight: "500" },
    switchLink: { fontWeight: "800" },

    socialSlot: { marginTop: 40, alignItems: "center", paddingHorizontal: 20 },
    socialTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 20 },
    socialRow: { flexDirection: "row", gap: 20 },
    socialIcon: { width: 65, height: 65, borderRadius: 22, justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }
});
