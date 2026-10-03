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
    View,
} from "react-native";
import TextDefault from "@/components/core/text-core";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import StatusBar from "@/components/core/status-bar";

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
        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
        });
        setLoading(false);
        if (error) {
            // console.error(error);

            if (error.code === "INVALID_EMAIL") {
                setError("E-mail inválido");
            } else if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
                setError("E-mail ou senha incorreta");
            } else if (error.code === "USER_NOT_FOUND") {
                setError("Usuário não encontrado");
            } else {
                setError("Não foi possível entrar");
            }

            // setError(error.message ?? "Não foi possível entrar")
        }
    };

    return (
        <>
        <StatusBar />
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={["#E9FFFA", "#A6FFEC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            zIndex: -1,
                            maxHeight: 464,
                            // justifyContent: "center",
                            alignItems: "center",
                            paddingTop: 44,
                        },
                    ]}
                >
                    <Image
                        source={require("@/assets/images/splash-icon.png")}
                        style={{
                            width: "50%",
                            height: "auto",
                            marginBottom: 20,
                            aspectRatio: 1,
                        }}
                    />
                </LinearGradient>
                <View
                    style={{
                        backgroundColor: "#161718",
                        padding: 24,
                        paddingTop: 32,
                        borderRadius: 24,
                        gap: 12,
                        flex: 1,
                        marginTop: 264,
                    }}
                >
                    <TextDefault style={styles.title}>Criar conta</TextDefault>
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
                    {error && (
                        <TextDefault style={styles.errorText}>
                            {error}
                        </TextDefault>
                    )}
                    <Button onPress={handleSignUp} loading={loading}>
                        Criar conta
                    </Button>
                    <Link href="/" style={styles.link}>
                        <TextDefault style={styles.linkText}>
                            Já tem conta? Entre aqui
                        </TextDefault>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </>
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
        color: "#00c89b",
        fontSize: 14,
    },
});
