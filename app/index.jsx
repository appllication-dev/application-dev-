import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // If user is logged in, go to tabs
    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    // If not logged in, go to login screen
    return <Redirect href="/screens/auth/LoginScreen" />;
}
