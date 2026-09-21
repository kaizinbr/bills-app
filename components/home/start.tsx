import TextDefault from "@/components/core/text-core";
import { useRouter } from "expo-router";
import {
    Pressable,
    StyleSheet,
    View
} from "react-native";

const HEADER_HEIGHT = 64;

export default function FromTheStart() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TextDefault style={styles.title}>
                Parece que não tem nada por aqui ainda...
            </TextDefault>
            <Pressable
                style={styles.button}
                onPress={() => router.push("/(out)/create-group")}
            >
                <TextDefault style={{ color: "#fff", fontWeight: "bold" }}>
                    Criar primeira conta
                </TextDefault>
            </Pressable>
            <Pressable
                style={styles.button}
                onPress={() => router.push("/(out)/add-account")}
            >
                <TextDefault style={{ color: "#fff", fontWeight: "bold" }}>
                    Entrar com código de convite
                </TextDefault>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 32,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#eeeeee",
        // fontSize: 16,
    },
    button: {
        backgroundColor: "#009C7A",
        padding: 12,
        borderRadius: 999,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});
