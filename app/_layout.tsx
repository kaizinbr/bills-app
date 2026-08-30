import { Stack } from "expo-router";
import { AuthProvider } from "@/components/core/auth-provider";
import { AppQueryProvider } from "@/lib/query-client";

import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    // console.log("RootLayout colorScheme", colorScheme);
    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <SafeAreaProvider>
                <AppQueryProvider>
                    <AuthProvider>
                        <SafeAreaView
                            edges={["left", "right"]}
                            style={{
                                flex: 1,
                            }}
                        >
                            <AnimatedSplashOverlay />
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                <Stack.Screen name="sign-up" />
                                <Stack.Screen name="(tabs)" />
                            </Stack>
                        </SafeAreaView>
                    </AuthProvider>
                </AppQueryProvider>
            </SafeAreaProvider>
        </ThemeProvider>
    );
}
