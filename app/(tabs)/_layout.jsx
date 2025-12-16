import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import index from "../(tabs)/index";
import save from "../(tabs)/Save";
import profile from "./profile";
import admin from "./admin"; // New Admin Tab
import ProductsDeltScreen from "../components/ProductsDeltScreen";
import ShippingScreen from "../screens/checkout/ShippingScreen";
import PaymentScreen from "../screens/checkout/PaymentScreen";
import EditProfile from "../components/EditProfile";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { CartContext, CartProvider } from "../../src/context/CardContext";
import { useAuth, AuthProvider } from "../../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";
import { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Basket from "./Basket";
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Tab Icon Component with Revolution Theme
const AnimatedTabIcon = ({ IconComponent, iconName, size, focused, carts }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
    const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: focused ? 1 : 0,
                useNativeDriver: true,
                damping: RevolutionTheme.animations.spring.damping,
                stiffness: RevolutionTheme.animations.spring.stiffness,
                mass: RevolutionTheme.animations.spring.mass || 0.8,
            }),
            Animated.timing(glowAnim, {
                toValue: focused ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [focused]);

    const activeScale = scaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.1],
    });

    return (
        <View style={styles.tabIconWrapper}>
            {/* Premium Gold Glow Background */}
            <Animated.View
                style={[
                    styles.tabIconGlow,
                    {
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }]
                    },
                ]}
            />

            <Animated.View style={{ transform: [{ scale: activeScale }] }}>
                <IconComponent
                    name={iconName}
                    size={size}
                    color={focused ? '#E5C158' : 'rgba(255,255,255,0.4)'}
                />
            </Animated.View>

            {iconName === "shopping-bag" && carts?.length > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{carts.length}</Text>
                </View>
            )}
        </View>
    );
};

// Custom Glass Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { carts } = useContext(CartContext);
    const { theme } = useTheme(); // Keeping theme context for logic if needed, but overriding visually

    // ... hiding logic same as before ...
    const profileRoute = state.routes.find(r => r.name === 'profile');
    if (profileRoute) {
        const routeName = getFocusedRouteNameFromRoute(profileRoute) ?? "";
        if (routeName === "Login" || routeName === "Register") return null;
    }
    const homeRoute = state.routes.find(r => r.name === 'index');
    if (homeRoute) {
        const routeName = getFocusedRouteNameFromRoute(homeRoute) ?? "";
        if (routeName === "ProductsDelt") return null;
    }
    const basketRoute = state.routes.find(r => r.name === 'Basket');
    if (basketRoute) {
        const routeName = getFocusedRouteNameFromRoute(basketRoute) ?? "";
        if (routeName === "ShippingScreen" || routeName === "PaymentScreen") return null;
    }

    const getIconForRoute = (routeName, focused) => {
        switch (routeName) {
            case 'index': return { IconComponent: Ionicons, iconName: focused ? 'home' : 'home-outline' };
            case 'Save': return { IconComponent: Feather, iconName: 'heart' };
            case 'Basket': return { IconComponent: Feather, iconName: 'shopping-bag' };
            case 'profile': return { IconComponent: Feather, iconName: 'user' };
            case 'admin': return { IconComponent: Ionicons, iconName: 'construct-outline' };
            default: return { IconComponent: Feather, iconName: 'circle' };
        }
    };

    return (
        <View style={styles.tabBarContainer}>
            {/* Background Layer with Blur (Clipped) */}
            <View style={styles.tabBarBackground}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            </View>

            {/* Content Layer (Not Clipped) */}
            <View style={styles.tabBarContent}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const { IconComponent, iconName } = getIconForRoute(route.name, isFocused);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                    };

                    if (route.name === 'admin') {
                        return (
                            <View key={route.key} style={styles.floatingButtonContainer}>
                                {/* Glow Effect */}
                                <View style={styles.floatingButtonGlow} />
                                {/* Outer Ring */}
                                <View style={styles.floatingButtonRing} />
                                <TouchableOpacity
                                    onPress={onPress}
                                    style={styles.floatingButtonTouchable}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#E5C158', '#D4AF37', '#B8860B']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.floatingButtonGradient}
                                    >
                                        <Ionicons name="add" size={32} color="#050505" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabButton}
                        >
                            <AnimatedTabIcon
                                IconComponent={IconComponent}
                                iconName={iconName}
                                size={24}
                                focused={isFocused}
                                carts={route.name === 'Basket' ? carts : null}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// ... stack navigators remain same ...
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyHomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="Home" component={index} />
    </Stack.Navigator>
);
const MyBasketStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="BasketMain" component={Basket} />
        <Stack.Screen name="ShippingScreen" component={ShippingScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    </Stack.Navigator>
);
const MyProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="ProfileMain" component={profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

const TabNavigatorContent = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                },
                sceneContainerStyle: { backgroundColor: 'transparent' } // Important for transparency
            }}
        >
            <Tab.Screen name="index" component={MyHomeStack} />
            <Tab.Screen name="Save" component={save} />
            <Tab.Screen name="admin" component={admin} />
            <Tab.Screen name="Basket" component={MyBasketStack} />
            <Tab.Screen name="profile" component={MyProfileStack} />
        </Tab.Navigator>
    );
};

const AppContent = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="MainTabs" component={TabNavigatorContent} />
            <Stack.Screen name="ProductsDelt" component={ProductsDeltScreen} />
        </Stack.Navigator>
    );
};

export default AppContent;

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        height: 65,
        elevation: 0, // Removed elevation from container
        zIndex: 100, // Ensure it's on top
    },
    tabBarBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: RevolutionTheme.colors.glass,
        borderWidth: 1.5,
        borderColor: RevolutionTheme.colors.glassBorder,
        // Shadows applied here
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    tabBarContent: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabIconWrapper: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconGlow: {
        position: 'absolute',
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        height: 18,
        minWidth: 18,
        borderRadius: 9,
        backgroundColor: '#E5C158',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#000',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    floatingButtonContainer: {
        position: 'relative',
        top: -24, // Lifted slightly more
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10, // Higher z-index to sit above background
    },
    floatingButtonGlow: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(229, 193, 88, 0.3)', // Soft gold glow
        opacity: 0.6,
        transform: [{ scale: 1.1 }],
    },
    floatingButtonRing: {
        position: 'absolute',
        width: 74,
        height: 74,
        borderRadius: 37,
        borderWidth: 2,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        backgroundColor: 'transparent',
    },
    floatingButtonTouchable: {
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#E5C158',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
    },
    floatingButtonGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
});



