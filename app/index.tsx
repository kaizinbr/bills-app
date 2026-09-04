import { useAuth } from "@/components/core/auth-provider";
import Button from "@/components/core/button";
import Input from "@/components/core/input";
import { authClient } from "@/lib/auth-client";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text
} from "react-native";

export default function SignIn() {
    const { session, isPending } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (isPending) return null; // pode trocar por um spinner
    if (session) return <Redirect href="/(tabs)/home" />;

    const handleSignIn = async () => {
        setError(null);
        setLoading(true);
        const { error } = await authClient.signIn.email({ email, password });
        setLoading(false);
        if (error) {
            setError(error.message ?? "Não foi possível entrar");
        }
        // se der certo, useSession atualiza sozinho e o Redirect acima
        // cuida da navegação — não precisa chamar router.navigate aqui
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Entrar</Text>

                <Input
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={!!error}
                />
                <Input
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={!!error}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button onPress={handleSignIn} loading={loading}>
                    Entrar
                </Button>

                <Link href="/sign-up" style={styles.link}>
                    <Text style={styles.linkText}>
                        Não tem conta? Cadastre-se
                    </Text>
                </Link>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#161718",
    },
    content: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
        gap: 12,
    },
    title: {
        color: "#eeeeee",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
    },
    errorText: {
        color: "#ff4d4f",
        fontSize: 14,
    },
    link: {
        marginTop: 16,
        alignSelf: "center",
    },
    linkText: {
        color: "#8065ef",
        fontSize: 14,
    },
});
