import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import { useTranslation } from "../../../src/hooks/useTranslation";
import { sanitizeEmail } from "../../../src/utils/helpers";
import { storage } from "../../../src/utils/storage";

const EditProfileScreen = () => {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    const [name, setName] = useState(user?.displayName || "");
    const [loading, setLoading] = useState(false);

    // Image state
    const [imageUri, setImageUri] = useState(user?.photoURL || null);
    const [loadingImage, setLoadingImage] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await updateUser({
                displayName: name.trim(),
                photoURL: imageUri
            });
            Alert.alert("Success", "Profile updated successfully");
            router.back();
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission", "We need access to your gallery.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const localUri = result.assets[0].uri;
                setImageUri(localUri);
                // Optionally save properly to storage/backend here if needed
            }
        } catch (error) {
            Alert.alert("Error", "Failed to select image");
        }
    };

    const styles = getStyles(isDark);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('editProfile') || "Edit Profile"}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Profile Image */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                            <Image
                                source={imageUri ? { uri: imageUri } : (user?.photoURL ? { uri: user.photoURL } : { uri: "https://via.placeholder.com/150" })}
                                style={styles.avatar}
                            />
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={14} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('fullName')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your Name"
                            placeholderTextColor={isDark ? "#666" : "#999"}
                        />
                    </View>

                    {/* Read Only Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={user?.email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email cannot be changed manually.</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveButtonText}>{t('saveChanges') || "Save Changes"}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? "#000" : "#FFFDF5",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? "#FFF" : "#2C2C2C",
    },
    content: {
        padding: 24,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#D4AF37', // Gold
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#D4AF37',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: isDark ? "#000" : "#FFF",
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? "#CCC" : "#666",
        marginBottom: 8,
    },
    input: {
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#FFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: isDark ? "#FFF" : "#000",
        borderWidth: 1,
        borderColor: isDark ? "transparent" : "rgba(0,0,0,0.1)",
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.6,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F5F5F5",
    },
    helperText: {
        fontSize: 12,
        color: isDark ? "#666" : "#999",
        marginTop: 6,
        marginLeft: 4,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    saveButton: {
        backgroundColor: '#D4AF37',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
