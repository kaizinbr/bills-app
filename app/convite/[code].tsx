import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function Convite() {
    const router = useRouter();
    const { code } = useLocalSearchParams<{ code: string }>();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.replace("/");
            return;
        }

        router.replace({ pathname: "/add-account", params: { code } });
    }, [isPending, session]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#161718",
            }}
        >
            <ActivityIndicator color={"#00c89b"} size={"large"} />
        </View>
    );
}