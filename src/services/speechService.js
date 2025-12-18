import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/**
 * Mock Speech Service
 * Since we don't have a real backend for STT and Native modules failed, 
 * this service mocks the behavior for demonstration.
 */

let recording = null;

// Mock responses for demo
const MOCK_RESPONSES = [
    "T-shirt",
    "Hoodie",
    "Shoes",
    "Watch",
    "Bag",
    "Cream",
    "Perfume",
    "Makeup",
    "Admin",
    "Basket",
    "Home"
];

const MOCK_ARABIC_RESPONSES = [
    "سلة",
    "الرئيسية",
    "عطور",
    "ملابس",
    "حذاء",
    "ساعة"
];

export const startRecording = async () => {
    try {
        // Request permissions
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
            throw new Error('Permission not granted');
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        // Start recording
        const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        recording = newRecording;
        return true;
    } catch (err) {
        console.error('Failed to start recording', err);
        return false;
    }
};

export const stopRecording = async () => {
    try {
        if (!recording) return null;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recording = null;
        return uri;
    } catch (err) {
        console.error('Failed to stop recording', err);
        return null;
    }
};

/**
 * Simulates sending audio to server and getting text back
 */
export const mockSpeechToText = async (language = 'en-US') => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Pick random result based on language simulation
            const rand = Math.random();
            let result = "";

            if (language.includes('ar')) {
                result = MOCK_ARABIC_RESPONSES[Math.floor(Math.random() * MOCK_ARABIC_RESPONSES.length)];
            } else {
                result = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
            }

            resolve({
                transcript: result,
                isFinal: true
            });
        }, 1500); // 1.5s delay to simulate network
    });
};

export const requestPermissions = async () => {
    const permission = await Audio.requestPermissionsAsync();
    return permission.status === 'granted';
};

export const speak = (text, language = 'en-US') => {
    Speech.speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.9,
    });
};
