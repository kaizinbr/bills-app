import { useEffect, useState } from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import {
    GoogleOneTapSignIn,
    isSuccessResponse,
    isCancelledResponse,
    isErrorWithCode,
} from "react-native-nitro-google-signin";
import { authClient } from "@/lib/auth-client";

export default function GoogleSignInButton() {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        GoogleOneTapSignIn.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string,
        });
    }, []);

    const entrarComGoogle = async () => {
        setLoading(true);
        setErro(null);

        try {
            await GoogleOneTapSignIn.checkPlayServices();

            const resposta = await GoogleOneTapSignIn.presentExplicitSignIn();
                        console.log("Resposta do Google One Tap Sign-In:", resposta);


            if (isCancelledResponse(resposta)) {
                return;
            }

            if (!isSuccessResponse(resposta)) {
                setErro("Nenhuma conta Google disponível neste dispositivo.");
                return;
            }

            const { error } = await authClient.signIn.social({
                provider: "google",
                idToken: { token: resposta.data.idToken },
            });

            if (error) {
                setErro(
                    error.message ?? "Falha ao validar o login no servidor.",
                );
            }
        } catch (e) {
            if (isErrorWithCode(e)) {
                setErro(`Erro do Google: ${e.code}`);
            } else {
                setErro("Erro inesperado ao entrar com o Google.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ gap: 8 }}>
            <Pressable
                onPress={entrarComGoogle}
                disabled={loading}
                style={{
                    height: 48,
                    borderRadius: 999,
                    backgroundColor: "#ffffff",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="#000000" />
                ) : (
                    <Text
                        style={{
                            color: "#000000",
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        Entrar com Google
                    </Text>
                )}
            </Pressable>
            {erro ? (
                <Text style={{ color: "#dc2626", fontSize: 13 }}>{erro}</Text>
            ) : null}
        </View>
    );
}
