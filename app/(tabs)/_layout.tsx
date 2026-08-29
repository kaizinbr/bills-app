import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/components/core/auth-provider";

export default function TabsLayout() {
    const { session, isPending } = useAuth();

    if (isPending) return null;
    if (!session) return <Redirect href="/" />;

    return (
        <Tabs
            initialRouteName="home"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#fff",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Início",
                    // headerShown: false
                }}
            />
            <Tabs.Screen name="option" options={{ title: "Perfil" }} />
            <Tabs.Screen name="modal" options={{ title: "Modal" }} />
            <Tabs.Screen
                name="create-group"
                options={{ title: "Create Group", href: null }}
            />
            <Tabs.Screen
                name="create-card/[groupId]"
                options={{ title: "Create Card", href: null }}
            />
            <Tabs.Screen
                name="create-purchase/[groupId]"
                options={{ title: "Create Purchase", href: null }}
            />
        </Tabs>
    );
}
