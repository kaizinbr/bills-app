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

export default function StatusBar() {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.statusBarBg,
                {
                    height: insets.top + 24,
                },
            ]}
        >
            <LinearGradient
                colors={["#161718", "transparent"]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    statusBarBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        zIndex: 50,
    },
});
