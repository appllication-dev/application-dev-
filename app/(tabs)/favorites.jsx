/**
 * Favorites Screen - Kataraa
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} د.ك`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => addToCart({ ...item, quantity: 1 })}
        >
          <Ionicons name="cart-outline" size={20} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <SafeAreaView>
          <Text style={styles.headerTitle}>المفضلة</Text>
          <Text style={styles.headerSubtitle}>{favorites.length} منتج</Text>
        </SafeAreaView>
      </LinearGradient>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>لا توجد منتجات مفضلة</Text>
          <Text style={styles.emptySubtitle}>اضغط على ❤️ لإضافة منتجات</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseBtnText}>تصفح المنتجات</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    color: '#1a1a2e',
    textAlign: 'right',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  addToCartBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(102,126,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  browseBtn: {
    marginTop: 30,
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
