// app/create-subscription.tsx
import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackBtn from "@/components/core/back-btn";

import { SubscriptionItem } from "@/components/subscriptions/subscription-item";
import { useDefaultStyles } from "react-native-ui-datepicker";
import { CardIcon } from "@solar-icons/react-native/linear/card";
import { DollarIcon } from "@solar-icons/react-native/bold/dollar";
import { formatCurrency } from "@/lib/format-currency";
import { AvatarGeneric } from "@/components/user/avatar";

export default function CreateSubscription() {
    const router = useRouter();
    const local = useLocalSearchParams();
    const invoiceId = local.invoiceId as string;
    console.log("invoiceId", invoiceId);

    const { session } = useAuth();
    const insets = useSafeAreaInsets();
    const defaultStyles = useDefaultStyles();

    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [members, setMembers] = useState<any>(null);
    const [unassignedTotal, setUnassignedTotal] = useState<number>(0);
    const [sharedAmount, setSharedAmount] = useState<number>(0);

    const fetchData = async () => {
        try {
            const response = await api.get(`/invoices/${invoiceId}/members`);
            setMembers(response.data.members);
            setUnassignedTotal(response.data.unassignedTotal);
            setSharedAmount(response.data.sharedAmount);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [invoiceId]);

    return (
        <View style={styles.main}>
            <StatusBar />
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"#fff"} size={"large"} />
                </View>
            ) : (
                <ScrollView
                    horizontal={false}
                    contentContainerStyle={{
                        paddingBottom: 32,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 8,
                        paddingTop: insets.top + 64,
                    }}
                    showsVerticalScrollIndicator={false}
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchData}
                            progressViewOffset={
                                Platform.OS === "android" ? 64 + insets.top : 0
                            }
                            progressBackgroundColor="#282828"
                            colors={["#5E8C61", "#5E8C61"]}
                            style={{
                                borderWidth: 0.5,
                                borderColor: "#56595D",
                            }}
                        />
                    }
                >
                    <BackBtn />
                    <TextDefault style={styles.title}>
                        Valores da fatura
                    </TextDefault>
                    <TextDefault style={styles.label}>
                        Aqui você pode ver os valores gastos por cada membro
                        nessa fatura e o valor que será dividido entre todos os
                        membros.
                    </TextDefault>
                    <Pressable
                        style={[styles.item]}
                        // onPress={() =>
                        //     router.push({
                        //         pathname: `/card/[id]`,
                        //         params: { id: member.id },
                        //     })
                        // }
                    >
                        <View
                            style={[
                                styles.cardIconContainer,
                                {
                                    backgroundColor: "#282828",
                                },
                            ]}
                        >
                            <DollarIcon size={20} color="white" />
                        </View>
                        <View>
                            <TextDefault style={styles.cardTitle}>
                                Valores não atribuídos
                            </TextDefault>
                            <TextDefault style={styles.description}>
                                {formatCurrency(unassignedTotal)}{" "}
                                <TextDefault style={styles.label}>
                                    ({formatCurrency(sharedAmount)} para cada
                                    membro)
                                </TextDefault>
                            </TextDefault>
                        </View>
                    </Pressable>
                    {members.length === 0 ? (
                        <TextDefault
                            style={{ color: "#fff", paddingHorizontal: 24 }}
                        >
                            Nenhum membro encontrado. Adicione um novo membro.
                        </TextDefault>
                    ) : (
                        members.map((member: any) => (
                            <Pressable
                                key={member.id}
                                style={[
                                    styles.item,
                                    {
                                        flexDirection: "row",
                                        gap: 8,
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    },
                                ]}
                                // onPress={() =>
                                //     router.push({
                                //         pathname: `/card/[id]`,
                                //         params: { id: member.id },
                                //     })
                                // }
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        alignItems: "center",
                                    }}
                                >
                                    <AvatarGeneric
                                        size={36}
                                        name={member.user.name}
                                    />
                                    <View>
                                        <TextDefault style={styles.cardTitle}>
                                            {member.user.name}
                                        </TextDefault>
                                        <TextDefault style={styles.description}>
                                            {formatCurrency(member.total)} + {formatCurrency(sharedAmount)}{" "}
                                        </TextDefault>
                                    </View>
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <TextDefault style={styles.cardTitle}>
                                        Total:
                                    </TextDefault>
                                    <TextDefault style={styles.total}>
                                        {formatCurrency(member.totalWithShared)}
                                    </TextDefault>
                                </View>
                            </Pressable>
                        ))
                    )}
                </ScrollView>
            )}

            {error && (
                <View
                    style={[
                        styles.overlay,
                        StyleSheet.absoluteFill,
                        { zIndex: 10 },
                    ]}
                >
                    <View style={styles.modalBox}>
                        <TextDefault
                            style={{
                                color: "#fff",
                                textAlign: "center",
                                fontWeight: "700",
                                fontSize: 16,
                                marginBottom: 8,
                            }}
                        >
                            {error}
                        </TextDefault>
                        <TextDefault
                            style={{ color: "#fff", textAlign: "center" }}
                        >
                            Verifique se todos os campos obrigatórios foram
                            preenchidos e tente novamente.
                        </TextDefault>
                        <Pressable
                            onPress={() => setError(null)}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Fechar
                            </TextDefault>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    container: {
        flex: 1,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        paddingHorizontal: 24,
    },
    label: {
        color: "#fff",
        fontSize: 12,
        // marginBottom: 8,
        paddingHorizontal: 24,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalBox: {
        backgroundColor: "#161718",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        maxWidth: 400,
        zIndex: 5,
    },
    cardButton: {
        backgroundColor: "#212223",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 16,
        height: 64,
        aspectRatio: 5 / 3,
        justifyContent: "flex-end",
    },
    cardButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
    cardButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    catButton: {
        backgroundColor: "#212223",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 16,
        height: 86,
        aspectRatio: 4 / 3,
        justifyContent: "flex-end",
    },
    catButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
    catButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        position: "absolute",
        bottom: 32,
        left: 16,
        right: 16,
        zIndex: 10,
        alignItems: "center",
    },

    item: {
        flexDirection: "row",
        // justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
        width: "100%",
    },

    buttons: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#282828",
        borderRadius: 8,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        color: "#ffffff",
    },
    description: {
        fontSize: 12,
        color: "#eee",
        fontWeight: "400",
    },
    total: {
        fontSize: 12,
        color: "#ffffff",
        fontWeight: "700",
    },
    cardIconContainer: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
});
