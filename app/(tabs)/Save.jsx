import { View, Text, StyleSheet, FlatList, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import FavoriteCard from '../components/FavoriteCard';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import PremiumBackground from '../components/PremiumBackground';
import { useTranslation } from '../../src/hooks/useTranslation';
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Save = () => {
    const { colors, theme } = useTheme();
    const { favorites, loading } = useFavorites();
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

    const renderEmptyState = () => (
        <Animated.View entering={FadeIn.duration(600)} style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                <Feather name="heart" size={64} color={themeTextSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeText }]}>{t('noSavedItems')}</Text>
            <Text style={[styles.emptySubtitle, { color: themeTextSecondary }]}>
                {t('noSavedDesc')}
            </Text>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: themeBg }}>
            {/* Background Gradient for Cream Mode */}
            {!isDark && (
                <LinearGradient
                    colors={RevolutionTheme.colors.gradient.cream}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {/* Background for Dark Mode */}
            {isDark && (
                <PremiumBackground style={StyleSheet.absoluteFill} />
            )}

            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: themeText }]}>{t('savedItems')}</Text>
                        <Text style={[styles.headerSubtitle, { color: themeTextSecondary }]}>
                            {favorites.length} {t('items')}
                        </Text>
                    </View>
                    <View style={[styles.headerIcon, { backgroundColor: RevolutionTheme.colors.primary }]}>
                        <Feather name="heart" size={24} color={isDark ? '#000' : '#FFF'} />
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
                        <FavoriteCard item={item} index={index} isGlass={true} isDark={isDark} />
                    )}
                    ListEmptyComponent={!loading ? renderEmptyState : null}
                />
            </SafeAreaView>
        </View>
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
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    headerIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
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
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default Save;

