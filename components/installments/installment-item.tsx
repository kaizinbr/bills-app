import TextDefault from "@/components/core/text-core";
import { PurchaseIcon } from "@/components/home/purchase-icon";
import { formatCurrency } from "@/lib/format-currency";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";

type ItemProps = {
    id: string;
    description: string | null;
    amount: number;
    dayOfMonth: number | null;
    category: {
        id: string;
        key: string;
        label: string;
        icon: string | null;
    } | null;
    card: {
        id: string;
        name: string;
        digits: string;
    } | null;
    purchases?: {
        id: string;
        description: string | null;
        installmentNumber: number;
        purchasedAt: string;
    }[];
};

export function InstallmentItem({
    id,
    description,
    amount,
    dayOfMonth,
    category,
    card,
    purchases,
}: ItemProps) {
    const router = useRouter();

    const [paids, setPaids] = useState(0);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const paidCount = (purchases ?? []).filter((purchase) => {
            const purchasedAt = new Date(purchase.purchasedAt);

            return (
                !Number.isNaN(purchasedAt.getTime()) &&
                purchasedAt < today
            );
        }).length;

        setPaids(paidCount);
    }, [purchases]);
    

    return (
        <Pressable
            style={({ pressed }) => [
                {
                    backgroundColor: pressed ? "#282828" : "#161718",
                },
                styles.item,
            ]}
            onPress={() => {
                router.push({
                    pathname: "/(out)/installment/[id]",
                    params: { id: id },
                });
            }}
        >
            <View
                style={{
                    flex: 1,
                    marginRight: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <PurchaseIcon categoryKey={category?.key} />
                <View style={{ flex: 1, gap: 4 }}>
                    <TextDefault style={styles.title}>
                        {description || category?.label || "Sem descrição"}
                    </TextDefault>
                    {description && (
                        <TextDefault style={styles.description}>
                            {category?.label || "Sem categoria"} • Dia{" "}
                            {dayOfMonth}
                        </TextDefault>
                    )}
                </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
                <TextDefault style={[styles.amount]}>
                    {formatCurrency(amount)}
                </TextDefault>
                    <TextDefault style={styles.card}>
                        {paids} de {purchases?.length} pagos
                    </TextDefault>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
    title: {
        fontSize: 14,
        color: "#eee",
    },
    description: {
        fontSize: 12,
        color: "#aaa",
    },
    amount: {
        fontSize: 14,
        color: "#fff",
        fontWeight: 600,
    },
    card: {
        fontSize: 12,
        color: "#ccc",
    },
    dayOfMonth: {
        fontSize: 12,
        color: "#ccc",
    },
});
