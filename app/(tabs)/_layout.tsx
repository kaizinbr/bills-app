import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/components/core/auth-provider";
import { OfflineBadge } from "@/components/core/offiline-badge";
import { View, StyleSheet } from "react-native";

import { HomeSmileAngleIcon } from "@solar-icons/react-native/linear/home-smile-angle";
import { GhostIcon } from "@solar-icons/react-native/linear/ghost";
import { StarIcon } from "@solar-icons/react-native/linear/star";

import { PieChart2Icon as ChartBoldIcon } from "@solar-icons/react-native/bold/pie-chart-2";
import { PieChart2Icon } from "@solar-icons/react-native/linear/pie-chart-2";

import { HomeSmileAngleIcon as HomeBoldIcon } from "@solar-icons/react-native/bold/home-smile-angle";
import { GhostIcon as GhostBoldIcon } from "@solar-icons/react-native/bold/ghost";
import { StarIcon as StarBoldIcon } from "@solar-icons/react-native/bold/star";

import { LinearGradient } from "expo-linear-gradient";

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
                    tabBarActiveTintColor: "#009C7A",
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        // position: "absolute", // <- isso que faltava: tira a barra do fluxo normal
                        // borderTopWidth: 0,
                        // elevation: 0, // no Android, elevation sozinho já desenha uma superfície sólida por baixo
                        backgroundColor: "#161718",
                        paddingVertical: 16,
                        minHeight: 64,
                    },
                    tabBarIconStyle: {
                        height: "100%",
                    },
                    // tabBarBackground: () => (
                    //     <LinearGradient
                    //         colors={["transparent", "#161718", "#161718"]}
                    //         locations={[0, 0.5, 1]}
                    //         style={StyleSheet.absoluteFill}
                    //     />
                    // ),
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Início",
                        tabBarIcon: ({ color, focused }) =>
                            focused ? (
                                <HomeBoldIcon color={color as string} />
                            ) : (
                                <HomeSmileAngleIcon color={color as string} />
                            ),
                    }}
                />

                <Tabs.Screen
                    name="option"
                    options={{
                        title: "Charts",
                        tabBarIcon: ({ color, focused }) =>
                            focused ? (
                                <ChartBoldIcon color={color as string} />
                            ) : (
                                <PieChart2Icon color={color as string} />
                            ),
                    }}
                />

                <Tabs.Screen
                    name="modal"
                    options={{
                        title: "Modal",
                        tabBarIcon: ({ color, focused }) =>
                            focused ? (
                                <StarBoldIcon color={color as string} />
                            ) : (
                                <StarIcon color={color as string} />
                            ),
                    }}
                />

                {/* <Tabs.Screen
                    name="create-group"
                    options={{
                        title: "Create Group",
                        href: null,
                    }}
                /> */}

                <Tabs.Screen
                    name="create-card/[groupId]"
                    options={{
                        title: "Create Card",
                        href: null,
                    }}
                />

                <Tabs.Screen
                    name="subscriptions/[groupId]"
                    options={{
                        title: "Create Card",
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="incomes/[invoiceId]"
                    options={{
                        title: "Create Card",
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="values/[invoiceId]"
                    options={{
                        title: "Create Card",
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="cards/[groupId]"
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
        backgroundColor: "#161718",
    },

    offlineContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 49, // altura aproximada da navbar
        zIndex: 1000,
    },
});
