import { Redirect, useRouter, useSegments, SplashScreen } from "expo-router";
import { useSettings } from "../src/context/SettingsContext";
import { useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

export default function Index() {
    const { isFirstLaunch } = useSettings();
    const { user, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    // Navigation is handled explicitly by screens (Login, Register, etc.)
    // We remove the automatic effect here to prevent race conditions during login.
    useEffect(() => {
        if (!loading) {
            SplashScreen.hideAsync();
        }
    }, [loading]);

    // If loading, render nothing (fast startup, no loading screen)
    if (loading) {
        return null;
    }

    // If first launch, go to onboarding
    if (isFirstLaunch) {
        return <Redirect href="/screens/OnboardingScreen" />;
    }

    // Go to tabs (home page)
    return <Redirect href="/(tabs)" />;
}

