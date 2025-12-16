import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PremiumBackground from './PremiumBackground';
import { useTheme } from '../../src/context/ThemeContext';

const PaymentMethods = ({ onClose, cards, onAdd, onDelete }) => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', cvv: '' });

    const handleDelete = (id) => {
        Alert.alert(
            "Remove Card",
            "Are you sure you want to remove this card?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => onDelete(id) }
            ]
        );
    };

    const handleAddCard = () => {
        if (!newCard.number || !newCard.expiry) {
            Alert.alert("Error", "Please fill in card details");
            return;
        }

        const card = {
            type: 'Visa', // Mock detection
            number: `**** **** **** ${newCard.number.slice(-4)} `,
            expiry: newCard.expiry,
            holder: newCard.holder,
            lastFour: newCard.number.slice(-4), // For display
        };

        onAdd(card);

        setShowAddModal(false);
        setNewCard({ number: '', expiry: '', holder: '', cvv: '' });
    };

    const renderCardItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[styles.card, { borderColor: colors.border }]}
        >
            <LinearGradientBackground style={styles.cardGradient} />
            <View style={styles.cardTop}>
                <Ionicons name="card" size={24} color="#fff" />
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            </View>

            <Text style={styles.cardNumber}>{item.number}</Text>

            <View style={styles.cardBottom}>
                <View>
                    <Text style={styles.cardLabel}>Card Holder</Text>
                    <Text style={styles.cardValue}>{item.holder}</Text>
                </View>
                <View>
                    <Text style={styles.cardLabel}>Expires</Text>
                    <Text style={styles.cardValue}>{item.expiry}</Text>
                </View>
            </View>

            {item.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.accent + '40' }]}>
                    <Text style={[styles.defaultText, { color: '#fff' }]}>Default</Text>
                </View>
            )}
        </Animated.View>
    );

    // Helper for card gradient - Keep dark/glassy even in light mode for credit card realism
    const LinearGradientBackground = ({ style }) => (
        <View style={[StyleSheet.absoluteFill, style, { backgroundColor: '#1A1F71', opacity: 0.9, borderRadius: 15 }]} />
    );

    return (
        <PremiumBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={cards}
                    renderItem={renderCardItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="card-outline" size={60} color={colors.textLight} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved cards</Text>
                        </View>
                    }
                />

                <Modal visible={showAddModal} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Card</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Card Number"
                                placeholderTextColor={colors.textLight}
                                keyboardType="numeric"
                                maxLength={16}
                                value={newCard.number}
                                onChangeText={t => setNewCard({ ...newCard, number: t })}
                            />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.textLight}
                                    maxLength={5}
                                    value={newCard.expiry}
                                    onChangeText={t => setNewCard({ ...newCard, expiry: t })}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.background, color: colors.text }]}
                                    placeholder="CVV"
                                    placeholderTextColor={colors.textLight}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    value={newCard.cvv}
                                    onChangeText={t => setNewCard({ ...newCard, cvv: t })}
                                />
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Card Holder Name"
                                placeholderTextColor={colors.textLight}
                                value={newCard.holder}
                                onChangeText={t => setNewCard({ ...newCard, holder: t })}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowAddModal(false)}>
                                    <Text style={[styles.btnText, { color: '#fff' }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent }]} onPress={handleAddCard}>
                                    <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    backButton: { padding: 5 },
    addButton: { padding: 5 },
    listContent: { padding: 20 },
    card: {
        height: 180,
        marginBottom: 20,
        borderRadius: 15,
        padding: 20,
        justifyContent: 'space-between',
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardGradient: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 2,
        marginTop: 10,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    defaultBadge: {
        position: 'absolute',
        top: 10,
        right: 40,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },
    defaultText: { fontSize: 10, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    input: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelBtn: { backgroundColor: 'rgba(255, 68, 68, 0.8)' },
    btnText: { fontWeight: '600' },
});

export default PaymentMethods;
