import api from "@/lib/api";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Input from "@/components/core/input";

import BackBtn from "@/components/core/back-btn";

import { useGroups } from "@/hooks/use-group";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CreateGroup() {
    const router = useRouter();

    const local = useLocalSearchParams();
    const id = local.id as string; // id da compra, se for edição
    const { data, refetch, isFetching } = useGroups();

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [inviteCode, setInviteCode] = useState("");

    useEffect(() => {
        setCanSubmit(inviteCode.length === 6);
    }, [inviteCode]);

    useEffect(() => {
        if (inviteCode.length === 6) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [inviteCode]);

    const handleAddGroup = () => {
        setLoading(true);

        api.post("/groups/join", { inviteCode })
            .then((res) => {
                refetch();
                router.push("/(tabs)/home");
            })
            .catch((err) => {
                setError(
                    err.response?.data?.error || "Erro ao entrar no grupo",
                );
                console.error(err);
                setLoading(false);
            });
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            <BackBtn />
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    horizontal={false}
                    contentContainerStyle={{
                        paddingBottom: 64,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 16,
                        paddingTop: insets.top + 64,
                    }}
                    style={[styles.container]}
                >
                    <TextDefault style={styles.title}>
                        Entrar com código de convite
                    </TextDefault>
                    <TextDefault style={styles.description}>
                        Adicione o código de convite que você recebeu para
                        entrar em uma conta existente.
                    </TextDefault>
                    {error && (
                        <TextDefault style={styles.error}>{error}</TextDefault>
                    )}
                    <Input
                        style={{
                            fontSize: 28,
                            fontWeight: "bold",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            width: "100%",
                            letterSpacing: 4,
                        }}
                        maxLength={6}
                        onChangeText={setInviteCode}
                    />
                    <Pressable
                        onPress={handleAddGroup}
                        style={({ pressed }) => [
                            styles.submitBtn,
                            {
                                // bottom: insets.bottom + 16,
                                opacity: canSubmit ? 1 : 0.5,
                                backgroundColor: pressed
                                    ? "#007B5E"
                                    : "#009C7A",
                            },
                        ]}
                        // disabled={!canSubmit}
                    >
                        <TextDefault
                            style={{ color: "#fff", fontWeight: "700" }}
                        >
                            Entrar
                        </TextDefault>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    description: {
        fontSize: 14,
    },
    inputContainer: {
        width: "100%",
        minWidth: "100%",
        backgroundColor: "#142825",
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
        textAlign: "center",
    },
    code: {
        color: "#eeeeee",
        fontSize: 28,
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        letterSpacing: 4,
    },

    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        justifyContent: "flex-end",
        width: "100%",
        alignItems: "center",
    },
    error: {
        color: "#ff4d4f",
        fontSize: 14,
        fontWeight: "bold",
    },
});
