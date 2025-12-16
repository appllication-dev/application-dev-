import { View, Text, TouchableOpacity, Alert } from 'react-native';

let GoogleSignin, GoogleSigninButton, statusCodes;

try {
    // Try to require the native module
    const GoogleModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleModule.GoogleSignin;
    GoogleSigninButton = GoogleModule.GoogleSigninButton;
    statusCodes = GoogleModule.statusCodes;
} catch (error) {
    console.warn("Google Sign-In native module not found. Using mocks.");

    // Mock implementation for Expo Go or when native module is missing
    statusCodes = {
        SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
        IN_PROGRESS: 'IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    };

    GoogleSignin = {
        configure: () => {
            console.log('GoogleSignin.configure called (Mock)');
        },
        hasPlayServices: async () => {
            console.log('GoogleSignin.hasPlayServices called (Mock)');
            return true;
        },
        signIn: async () => {
            console.log('GoogleSignin.signIn called (Mock)');
            Alert.alert(
                "Development Build Required",
                "Google Sign-In requires a native development build. It does not work in Expo Go. Please run 'npx expo run:android' or 'npx expo run:ios'."
            );
            throw new Error("Google Sign-In requires development build");
        },
        signOut: async () => { },
        isSignedIn: async () => false,
    };

    // Google Signin Button Mock
    GoogleSigninButton = ({ onPress, style, ...props }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[{
                backgroundColor: '#fff',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                minWidth: 200,
            }, style]}
            {...props}
        >
            <Text style={{ color: '#000', fontWeight: '600' }}>
                Sign in with Google (Dev Build Only)
            </Text>
        </TouchableOpacity>
    );

    // Add Size and Color constants since they are used in usage
    GoogleSigninButton.Size = {
        Icon: 'Icon',
        Standard: 'Standard',
        Wide: 'Wide',
    };

    GoogleSigninButton.Color = {
        Dark: 'Dark',
        Light: 'Light',
    };
}

export { GoogleSignin, GoogleSigninButton, statusCodes };
