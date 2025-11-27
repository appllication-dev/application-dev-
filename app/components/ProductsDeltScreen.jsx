import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState, useContext } from "react";
import { CartContext } from "../../src/context/CardContext";
import {
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    Dimensions,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const { height } = Dimensions.get("window");
const sizes = ["S", "M", "L", "XL"];
const colorsary = ["#b7adad", "#000000", "#006912", "#0004d7"];

const ProductsDeltScreen = () => {
    const navigation = useNavigation();
    const { addToCart } = useContext(CartContext);
    const route = useRoute();
    const item = route?.params?.item ?? {};
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);  const handleAddTOCart = (product) => {
        if (!selectedSize || !selectedColor) {
            Alert.alert(
                "Selection Required",
                "Please choose a size and a color to proceed."
            );
            return;
        }
        const productToAdd = {
            ...product,
            size: selectedSize,
            color: selectedColor,
        };
        addToCart(productToAdd);
        navigation.navigate("Basket");
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            {/* Full Screen Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay} />

                {/* Header Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={22} color="#1A1A1A" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {item.title?.toUpperCase() || 'PRODUCT'}
                    </Text>

                    <TouchableOpacity style={styles.headerButton}>
                        <Feather name="heart" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Sheet */}
            <View style={styles.contentContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.price}>${item.price}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Size</Text>
                        <View style={styles.optionsRow}>
                            {sizes.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.sizeOption,
                                        selectedSize === size && styles.selectedSizeOption,
                                    ]}
                                    onPress={() => setSelectedSize(size)}
                                >
                                    <Text
                                        style={[
                                            styles.sizeText,
                                            selectedSize === size && styles.selectedSizeText,
                                        ]}
                                    >
                                        {size}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Color</Text>
                        <View style={styles.optionsRow}>
                            {colorsary.map((color, idx) => (
                                <TouchableOpacity
                                    key={color + idx}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorOptionWrapper,
                                        selectedColor === color && { borderColor: color },
                                    ]}
                                >
                                    <View style={[styles.colorOption, { backgroundColor: color }]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            A creatively styled unisex hoodie by BOSS. This hooded sweatshirt is cut to a straight fit in French terry with a drawstring hood.
                        </Text>
                    </View>
                </ScrollView>

                {/* Bottom Action Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddTOCart(item)}
                        activeOpacity={0.8}
                    >
                        <Feather name="shopping-bag" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                        <Text style={styles.addToCartText}>ADD TO SHOPPING BAG</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    imageContainer: {
        height: height * 0.55,
        width: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.02)",
    },
    topBar: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        marginHorizontal: 12,
    },
    contentContainer: {
        flex: 1,
        marginTop: -40,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingHorizontal: 24,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    price: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FF6B6B",
        marginBottom: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    sizeOption: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginRight: 12,
        marginBottom: 12,
        minWidth: 60,
        alignItems: 'center',
    },
    selectedSizeOption: {
        backgroundColor: "#1A1A1A",
        borderColor: "#1A1A1A",
    },
    sizeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    selectedSizeText: {
        color: "#FFFFFF",
    },
    colorOptionWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
        marginBottom: 12,
    },
    colorOption: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    descriptionSection: {
        marginBottom: 70,
    },
    descriptionText: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 22,
    },
    footer: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    addToCartButton: {
        backgroundColor: "#1A1A1A",
        borderRadius: 50,
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 1,
    },
});

export default ProductsDeltScreen;