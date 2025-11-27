import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFavorites } from '../../src/context/FavoritesContext';

const SaveTabIcon = ({ color }) => {
    const { favorites } = useFavorites();

    return (
        <View style={{ position: "relative" }}>
            <FontAwesome name="heart" size={25} color={color} style={styles.icon} />
            {favorites?.length > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    icon: {
        marginTop: 4,
    },
    badge: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: "#FF6B6B",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: -5,
        right: -5,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});

export default SaveTabIcon;
