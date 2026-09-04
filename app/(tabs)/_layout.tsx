import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/components/core/auth-provider";
import { OfflineBadge } from "@/components/core/offiline-badge";
import { View, StyleSheet } from "react-native";

export default function TabsLayout() {
    const { session, isPending } = useAuth();

    if (isPending) return null;
    if (!session) return <Redirect href="/" />;

    return (
        <View style={styles.container}>
            <Tabs
                initialRouteName="home"
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#fff",
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{ title: "Início" }}
                />

                <Tabs.Screen
                    name="option"
                    options={{ title: "Perfil" }}
                />

                <Tabs.Screen
                    name="modal"
                    options={{ title: "Modal" }}
                />

                <Tabs.Screen
                    name="create-group"
                    options={{
                        title: "Create Group",
                        href: null,
                    }}
                />

                <Tabs.Screen
                    name="create-card/[groupId]"
                    options={{
                        title: "Create Card",
                        href: null,
                    }}
                />

            </Tabs>

            <View style={styles.offlineContainer}>
                <OfflineBadge />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    offlineContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 49, // altura aproximada da navbar
        zIndex: 1000,
    },
});