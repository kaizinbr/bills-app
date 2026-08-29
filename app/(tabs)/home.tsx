import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { useAuth } from "@/components/core/auth-provider";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/core/button";
import Avatar from "@/components/user/avatar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Groups from "@/components/home/groups";
import StatusBar from "@/components/core/status-bar";

export default function Home() {
    const { session } = useAuth();

    const { height } = useWindowDimensions();
    const HEADER_MAX_HEIGHT = height * 0.4;

    const scrollOffsetY = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const handleScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollOffsetY.value = event.contentOffset.y;
        },
    });

    const statusBarOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            scrollOffsetY.value,
            [100, 160],
            [0, 1],
            Extrapolation.CLAMP,
        ),
    }));

    return (
        <>
            <StatusBar />
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingBottom: 64,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: 8,
                }}
                showsVerticalScrollIndicator={false}
            >
            
                {/* <Animated.View
                    style={[
                        styles.statusBarBg,
                        {
                            height: insets.top + 24,
                        },
                        // statusBarOpacityStyle,
                    ]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={["#5E8C61", "transparent"]}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View> */}
                {/* <Animated.View
                    style={[
                        styles.statusBarBg,
                        {
                            height: HEADER_MAX_HEIGHT,
                        },
                        // statusBarOpacityStyle,
                    ]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={["#5E8C61", "transparent"]}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View> */}
                <Avatar />
                <Text style={styles.title}>Olá, {session?.user.name}</Text>
                <Button onPress={() => authClient.signOut()}>Sair</Button>
                <Groups />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#161718",
        gap: 8,
        padding: 16,
        paddingTop: 64,
        flexDirection: "column",
    },
    title: {
        color: "#eeeeee",
        fontSize: 20,
    },

    statusBarBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        zIndex: 0,
    },
});
