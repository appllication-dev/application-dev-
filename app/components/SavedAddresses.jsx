import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PremiumBackground from './PremiumBackground';
import { useTheme } from '../../src/context/ThemeContext';

const SavedAddresses = ({ onClose, addresses, onAdd, onDelete }) => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    const [showAddModal, setShowAddModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: '', name: '', address: '', phone: '' });

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(id) }
            ]
        );
    };

    const handleAddAddress = () => {
        if (!newAddress.label || !newAddress.address) {
            Alert.alert("Error", "Please fill in at least Label and Address");
            return;
        }

        onAdd(newAddress);

        setShowAddModal(false);
        setNewAddress({ label: '', name: '', address: '', phone: '' });
    };

    const renderAddressItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.labelContainer}>
                    <Ionicons
                        name={(item.label?.toLowerCase() || '') === 'home' ? 'home' : (item.label?.toLowerCase() || '') === 'work' ? 'briefcase' : 'location'}
                        size={18}
                        color={colors.text}
                    />
                    <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                    {item.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.accent + '20' }]}>
                            <Text style={[styles.defaultText, { color: colors.accent }]}>Default</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.address, { color: colors.textSecondary }]}>{item.address}</Text>
            <Text style={[styles.phone, { color: colors.textLight }]}>{item.phone}</Text>

            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.border }]}>
                <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <PremiumBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Addresses</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="location-outline" size={60} color={colors.textLight} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved addresses</Text>
                        </View>
                    }
                />

                <Modal visible={showAddModal} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Address</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Label (e.g. Home)"
                                placeholderTextColor={colors.textLight}
                                value={newAddress.label}
                                onChangeText={t => setNewAddress({ ...newAddress, label: t })}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Full Name"
                                placeholderTextColor={colors.textLight}
                                value={newAddress.name}
                                onChangeText={t => setNewAddress({ ...newAddress, name: t })}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Address"
                                placeholderTextColor={colors.textLight}
                                value={newAddress.address}
                                onChangeText={t => setNewAddress({ ...newAddress, address: t })}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                                placeholder="Phone Number"
                                placeholderTextColor={colors.textLight}
                                value={newAddress.phone}
                                onChangeText={t => setNewAddress({ ...newAddress, phone: t })}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowAddModal(false)}>
                                    <Text style={[styles.btnText, { color: '#fff' }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.accent }]} onPress={handleAddAddress}>
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
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '700', marginLeft: 8, marginRight: 10 },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },
    defaultText: { fontSize: 10, fontWeight: '600' },
    name: { fontSize: 15, marginBottom: 4 },
    address: { fontSize: 14, marginBottom: 4 },
    phone: { fontSize: 14, marginBottom: 10 },
    editButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editButtonText: { fontSize: 12 },
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

export default SavedAddresses;
