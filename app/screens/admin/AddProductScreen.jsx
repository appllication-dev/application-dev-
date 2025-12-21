
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Updated
import { useTheme } from '../../../src/context/ThemeContext';
import { addProduct, updateProduct, refillAllProductsStock } from '../../../src/services/firestoreProducts'; // Updated
import Feather from 'react-native-vector-icons/Feather';
import { FontSize, Spacing, BorderRadius } from '../../../constants/theme';
import { useTranslation } from '../../../src/hooks/useTranslation';

import * as ImagePicker from 'expo-image-picker'; // New Import

const AddProductScreen = () => {
    const { colors, theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams(); // Get params
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const isEditing = !!params.id; // Check mode

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState(params.images ? JSON.parse(params.images) : []);
    const [formData, setFormData] = useState({
        title: params.title || '',
        price: params.price ? params.price.toString() : '',
        category: params.category || 'T-shirt',
        description: params.description || '',
        stock: params.stock ? params.stock.toString() : '10'
    });

    // Handle single image fallback for legacy data
    React.useEffect(() => {
        if (isEditing && images.length === 0 && params.image) {
            setImages([params.image]);
        }
    }, [isEditing]);

    const categories = ['T-shirt', 'Hoodie', 'Discount', 'Hat'];

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, // Allow multiple
            selectionLimit: 5,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.price || images.length === 0) {
            Alert.alert('Error', 'Please fill in required fields and add at least one image');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                ...formData,
                image: images[0], // Main image (first one)
                images: images,   // Full array
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            };

            if (isEditing) {
                await updateProduct(params.id, productData);
                Alert.alert('Success', 'Product updated successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                await addProduct({ ...productData, isNew: true });
                Alert.alert('Success', 'Product added successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} product: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </Text>
                <TouchableOpacity onPress={async () => {
                    Alert.alert('Refill All Stock', 'Are you sure you want to set stock to 50 for ALL products?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Yes', onPress: async () => {
                                setLoading(true);
                                const res = await refillAllProductsStock(50);
                                setLoading(false);
                                if (res.success) Alert.alert('Success', `Refilled ${res.count} products`);
                                else Alert.alert('Error', res.error);
                            }
                        }
                    ]);
                }}>
                    <Feather name="package" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Image Preview */}
                {/* Images Section */}
                <View style={styles.imageSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: img }} style={styles.previewImageItem} resizeMode="cover" />
                                <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageBtn}>
                                    <Feather name="x" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={pickImage}
                            style={[styles.addImageBtn, { borderColor: colors.border }]}
                        >
                            <Feather name="camera" size={24} color={colors.textLight} />
                            <Text style={{ color: colors.textLight, fontSize: 10, marginTop: 4 }}>Add</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        placeholder="Product Name"
                        placeholderTextColor={colors.textLight}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Price ($) *</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        placeholder="49.99"
                        placeholderTextColor={colors.textLight}
                        keyboardType="numeric"
                        value={formData.price}
                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                    />

                    {/* Category Label */}
                    <View style={styles.categoryContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    formData.category === cat && { backgroundColor: colors.primary },
                                    formData.category !== cat && { borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setFormData({ ...formData, category: cat })}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    formData.category === cat ? { color: '#fff' } : { color: colors.text }
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Stock</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        placeholder="10"
                        keyboardType="numeric"
                        placeholderTextColor={colors.textLight}
                        value={formData.stock}
                        onChangeText={(text) => setFormData({ ...formData, stock: text })}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEditing ? 'Save Changes' : 'Create Product'}
                        </Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    imageSection: {
        marginBottom: 20,
    },
    imageList: {
        flexDirection: 'row',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImageItem: {
        width: '100%',
        height: '100%',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: 4,
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        gap: 15,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 15,
        borderWidth: 1,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryText: {
        fontWeight: '600',
    },
    submitButton: {
        height: 55,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 50,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
});

export default AddProductScreen;
