import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";

const EditProfile = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const { colors } = useTheme();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }

        setLoading(true);
        try {
            await updateUser({ name: name.trim(), email: email.trim() });
            Alert.alert("Success!", "Profile updated successfully", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Edit Profile
                        </Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: colors.profilePrimary },
                                loading && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.border }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        textAlign: "left",
    },
    saveButton: {
        borderRadius: 12,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    cancelButton: {
        borderRadius: 12,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        borderWidth: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default EditProfile;
