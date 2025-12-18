import { Redirect, useRouter, useSegments, SplashScreen } from "expo-router";
import { useSettings } from "../src/context/SettingsContext";
import { useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

import PremiumSplash from "../app/components/PremiumSplash";

export default function Index() {
    const { isFirstLaunch } = useSettings();
    const { user, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    // Hide native splash immediately so our PremiumSplash takes over
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    // If loading, render our Custom Splash
    if (loading) {
        return <PremiumSplash />;
    }

    // If first launch, go to onboarding
    if (isFirstLaunch) {
        return <Redirect href="/screens/OnboardingScreen" />;
    }

    // Go to tabs (home page)
    return <Redirect href="/(tabs)" />;
}

