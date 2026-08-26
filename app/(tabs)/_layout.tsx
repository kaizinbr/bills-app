import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/components/core/auth-provider";

export default function TabsLayout() {
    const { session, isPending } = useAuth();

    if (isPending) return null;
    if (!session) return <Redirect href="/" />;

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="home" options={{ title: "Início" }} />
            <Tabs.Screen name="explore" options={{ title: "Perfil" }} />
        </Tabs>
    );
}