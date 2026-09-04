import { AltArrowUpIcon } from "@solar-icons/react-native/linear/alt-arrow-up";
import { Animated, Pressable, ScrollView, StyleSheet } from "react-native";

const BUTTON_THRESHOLD = 600;
const BUTTON_OFFSET = 26;

export default function ScrollToTopBtn({
    scrollRef,
    scrollY,
}: {
    scrollRef: React.RefObject<ScrollView> | any;
    scrollY: Animated.Value;
}) {
    const handlePress = () => {
        if (scrollRef?.current) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    const buttonOpacity = scrollY.interpolate({
        inputRange: [BUTTON_THRESHOLD - 20, BUTTON_THRESHOLD, BUTTON_THRESHOLD + 20],
        outputRange: [0, 1, 1],
        extrapolate: "clamp",
    });

    const buttonScale = scrollY.interpolate({
        inputRange: [BUTTON_THRESHOLD - 20, BUTTON_THRESHOLD, BUTTON_THRESHOLD + 20],
        outputRange: [0.8, 1, 1],
        extrapolate: "clamp",
    });

    const buttonTranslateY = Animated.diffClamp(
        scrollY,
        0,
        BUTTON_THRESHOLD,
    ).interpolate({
        inputRange: [0, BUTTON_THRESHOLD],
        outputRange: [BUTTON_OFFSET, 0],
        extrapolate: "clamp",
    });

    return (
        <Animated.View
            style={[
                styles.buttonContainer,
                {
                    opacity: buttonOpacity,
                    transform: [
                        { translateX: -16 },
                        { translateY: buttonTranslateY },
                        { scale: buttonScale },
                    ],
                },
            ]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={handlePress}
                hitSlop={10}
            >
                <AltArrowUpIcon size={16} color="#fff" />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        position: "absolute",
        top: 72,
        left: "50%",
        zIndex: 1000,
        pointerEvents: "none",
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2b2b2b",
        borderWidth: 1,
        borderColor: "#3a3a3a",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 6,
        pointerEvents: "auto",
    },
    buttonPressed: {
        transform: [{ scale: 0.96 }],
        backgroundColor: "#3a3a3a",
    },
});