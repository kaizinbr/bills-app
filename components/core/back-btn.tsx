import { useRouter } from "expo-router";
import { AltArrowLeftIcon } from "@solar-icons/react-native/linear/alt-arrow-left";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BackBtn({ onPress }: { onPress?: () => void }) {
    const router = useRouter();
        const insets = useSafeAreaInsets();

    return (
        <View style={[styles.main, { top: insets.top + 8 }]}>
            <Pressable
                onPress={() => {
                    if (onPress) {
                        onPress();
                    } else {
                        router.back();
                    }
                }}
            >
                <AltArrowLeftIcon size={26} strokeWidth={2} color="#fff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "rgba(22, 23, 24, 0.8)",
        padding: 8,
        paddingLeft: 6,
        paddingRight: 10,
        position: "absolute",
        left: 8,
        zIndex: 100,
        borderRadius: 9999,
    },
});
