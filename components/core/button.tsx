import { useRouter, Href } from "expo-router";
// import TextDefault from "@/components/core/text-core";
import { Pressable, PressableProps, StyleSheet, Text, ActivityIndicator } from "react-native";

type ButtonProps = PressableProps & {
    children: string;
    route?: Href;
    loading?: boolean;
};

export default function Button({
    children,
    route,
    style,
    loading,
    ...props
}: ButtonProps) {
    const router = useRouter();

    const handlePress = () => {
        if (route) {
            router.navigate(route);
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                style,
            ]}
            onPress={handlePress}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <Text style={styles.text}>{children}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#282828",
        padding: 12,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    pressed: {
        opacity: 0.75,
    },
});
