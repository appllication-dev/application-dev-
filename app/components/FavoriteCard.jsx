import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Animated, { FadeInDown, FadeOutRight } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { CartContext } from '../../src/context/CardContext';

const { width } = Dimensions.get('window');

const FavoriteCard = ({ item, index }) => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { removeFromFavorites } = useFavorites();
    const { addToCart } = useContext(CartContext);

    const handleRemove = () => {
        removeFromFavorites(item.id);
    };

    const handleAddToCart = () => {
        // Add with default size and color
        const productToAdd = {
            ...item,
            size: 'M',
            color: '#000000',
        };
        addToCart(productToAdd);
    };

    const handleViewDetails = () => {
        navigation.navigate('ProductsDelt', { item });
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            exiting={FadeOutRight.duration(300)}
            style={[styles.container, { backgroundColor: colors.card }]}
        >
            <TouchableOpacity
                style={styles.cardContent}
                onPress={handleViewDetails}
                activeOpacity={0.9}
            >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={[styles.priceBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.priceText}>${item.price}</Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsContainer}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.category && (
                        <Text style={[styles.category, { color: colors.textSecondary }]}>
                            {item.category}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddToCart}
                    activeOpacity={0.8}
                >
                    <Feather name="shopping-cart" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton, { backgroundColor: colors.cardSecondary }]}
                    onPress={handleRemove}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="heart" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: (width - 48) / 2,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    cardContent: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    detailsContainer: {
        padding: 12,
        paddingBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    category: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    actionsContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 8,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    removeButton: {
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
});

export default FavoriteCard;
