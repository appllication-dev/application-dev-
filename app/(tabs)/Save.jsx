import { View, Text, StyleSheet, FlatList, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import FavoriteCard from '../components/FavoriteCard';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import PremiumBackground from '../components/PremiumBackground';

const { width } = Dimensions.get('window');

const Save = () => {
    const { colors } = useTheme();
    const { favorites, loading } = useFavorites();

    const renderEmptyState = () => (
        <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Feather name="heart" size={80} color="rgba(255,255,255,0.5)" />
            </View>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start adding products to your wishlist{'\n'}and they'll appear here
            </Text>
        </Animated.View>
    );

    return (
        <PremiumBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>My Favorites</Text>
                        <Text style={styles.headerSubtitle}>
                            {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <Feather name="heart" size={28} color="#FFFFFF" />
                    </View>
                </Animated.View>

                {/* Favorites Grid */}
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <FavoriteCard item={item} index={index} isGlass={true} />
                    )}
                    ListEmptyComponent={!loading ? renderEmptyState : null}
                />
            </SafeAreaView>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    headerIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
        color: '#fff',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        color: 'rgba(255,255,255,0.8)',
    },
});

export default Save;

