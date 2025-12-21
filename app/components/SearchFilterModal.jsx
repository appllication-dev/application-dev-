import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

const SearchFilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useTranslation();

    const [priceRange, setPriceRange] = useState({ min: initialFilters.minPrice || '', max: initialFilters.maxPrice || '' });
    const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'newest');
    const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
    const [onlyInStock, setOnlyInStock] = useState(initialFilters.onlyInStock || false);

    const categories = [
        { id: 'all', label: t('all') },
        { id: 'T-shirt', label: t('tshirt') },
        { id: 'Hoodie', label: t('hoodie') },
        { id: 'Discount', label: t('discount') },
        { id: 'Hat', label: t('hat') }
    ];

    const sortOptions = [
        { id: 'newest', label: t('newArrival') },
        { id: 'price_low', label: t('priceLowToHigh') },
        { id: 'price_high', label: t('priceHighToLow') },
    ];

    const handleApply = () => {
        onApply({
            minPrice: priceRange.min ? parseFloat(priceRange.min) : null,
            maxPrice: priceRange.max ? parseFloat(priceRange.max) : null,
            sortBy,
            category: selectedCategory === 'all' ? null : selectedCategory,
            onlyInStock
        });
        onClose();
    };

    const handleReset = () => {
        setPriceRange({ min: '', max: '' });
        setSortBy('newest');
        setSelectedCategory('all');
        setOnlyInStock(false);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={[styles.content, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>{t('filters')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        {/* Sort By */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isDark ? '#CCC' : '#666' }]}>{t('sortBy')}</Text>
                            <View style={styles.chipsContainer}>
                                {sortOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.chip,
                                            sortBy === option.id && { backgroundColor: RevolutionTheme.colors.primary, borderColor: RevolutionTheme.colors.primary },
                                            { borderColor: isDark ? '#333' : '#EEE' }
                                        ]}
                                        onPress={() => setSortBy(option.id)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            sortBy === option.id ? { color: '#000' } : { color: isDark ? '#FFF' : '#000' }
                                        ]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isDark ? '#CCC' : '#666' }]}>{t('priceRange')}</Text>
                            <View style={styles.priceInputs}>
                                <View style={[styles.priceInputContainer, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}>
                                    <Text style={{ color: isDark ? '#AAA' : '#888' }}>$</Text>
                                    <TextInput
                                        style={[styles.priceInput, { color: isDark ? '#FFF' : '#000' }]}
                                        placeholder="Min"
                                        placeholderTextColor={isDark ? '#666' : '#999'}
                                        keyboardType="numeric"
                                        value={priceRange.min}
                                        onChangeText={text => setPriceRange(prev => ({ ...prev, min: text }))}
                                    />
                                </View>
                                <Text style={{ color: isDark ? '#666' : '#999' }}>-</Text>
                                <View style={[styles.priceInputContainer, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}>
                                    <Text style={{ color: isDark ? '#AAA' : '#888' }}>$</Text>
                                    <TextInput
                                        style={[styles.priceInput, { color: isDark ? '#FFF' : '#000' }]}
                                        placeholder="Max"
                                        placeholderTextColor={isDark ? '#666' : '#999'}
                                        keyboardType="numeric"
                                        value={priceRange.max}
                                        onChangeText={text => setPriceRange(prev => ({ ...prev, max: text }))}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Categories */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isDark ? '#CCC' : '#666' }]}>{t('category')}</Text>
                            <View style={styles.chipsContainer}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.chip,
                                            selectedCategory === cat.id && { backgroundColor: RevolutionTheme.colors.primary, borderColor: RevolutionTheme.colors.primary },
                                            { borderColor: isDark ? '#333' : '#EEE' }
                                        ]}
                                        onPress={() => setSelectedCategory(cat.id)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            selectedCategory === cat.id ? { color: '#000' } : { color: isDark ? '#FFF' : '#000' }
                                        ]}>{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* In Stock Only */}
                        <View style={[styles.section, styles.rowBetween]}>
                            <Text style={[styles.sectionTitle, { color: isDark ? '#CCC' : '#666', marginBottom: 0 }]}>{t('onlyInStock')}</Text>
                            <Switch
                                value={onlyInStock}
                                onValueChange={setOnlyInStock}
                                trackColor={{ false: '#767577', true: RevolutionTheme.colors.primary }}
                                thumbColor={onlyInStock ? '#FFF' : '#f4f3f4'}
                            />
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: isDark ? '#333' : '#EEE' }]}>
                        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                            <Text style={{ color: isDark ? '#AAA' : '#666' }}>{t('resetFilters')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleApply} style={[styles.applyButton, { backgroundColor: RevolutionTheme.colors.primary }]}>
                            <Text style={styles.applyButtonText}>{t('applyFilters')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    priceInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
    },
    priceInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        alignItems: 'center',
        gap: 16,
    },
    resetButton: {
        padding: 12,
    },
    applyButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SearchFilterModal;
