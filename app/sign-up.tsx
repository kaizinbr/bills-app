import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Redirect, Link } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/core/auth-provider";
import Input from "@/components/core/input";
import Button from "@/components/core/button";

export default function SignUp() {
    const { session, isPending } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (isPending) return null;
    if (session) return <Redirect href="/(tabs)/home" />;

    const handleSignUp = async () => {
        setError(null);
        setLoading(true);
        const { error } = await authClient.signUp.email({ name, email, password });
        setLoading(false);
        if (error) {
            setError(error.message ?? "Não foi possível criar a conta");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar conta</Text>

            <Input
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                error={!!error}
            />
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

            <Button onPress={handleSignUp} loading={loading}>
                Criar conta
            </Button>

            <Link href="/" style={styles.link}>
                <Text style={styles.linkText}>Já tem conta? Entrar</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#161718",
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