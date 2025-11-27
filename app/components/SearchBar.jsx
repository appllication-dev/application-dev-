import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Shadows } from '../../constants/theme';

const SearchBar = ({ value, onChangeText, placeholder = "Search for products...", debounceMs = 300 }) => {
    const { colors } = useTheme();
    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimeout = useRef(null);
    const clearButtonScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        Animated.spring(clearButtonScale, {
            toValue: localValue.length > 0 ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [localValue]);

    const handleChange = (text) => {
        setLocalValue(text);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            onChangeText(text);
        }, debounceMs);
    };

    const handleClear = () => {
        setLocalValue('');
        onChangeText('');
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                },
            ]}
        >
            <Fontisto name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
            <TextInput
                style={[styles.input, { color: '#FFFFFF' }]}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={localValue}
                onChangeText={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <Animated.View style={{ transform: [{ scale: clearButtonScale }] }}>
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                >
                    <Feather name="x-circle" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 24,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
});

export default SearchBar;
