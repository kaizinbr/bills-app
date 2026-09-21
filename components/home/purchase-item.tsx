import TextDefault from "@/components/core/text-core";
import { formatCurrency } from "@/lib/format-currency";
import { StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { PurchaseIcon } from "@/components/home/purchase-icon";

type PurchaseItemProps = {
    id: string;
    description: string | null;
    amount: number;
    purchasedAt: string | null;
    invoiceId: string | null;
    cardId: string | null;
    userId: string | null;
    installmentPlanId: string | null;
    installmentNumber: number | null;
    subscriptionId: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
    category: {
        id: string;
        key: string;
        label: string;
        icon: string | null;
    } | null;
    subscription: {
        id: string;
        name: string;
        description: string | null;
    };
    installmentPlan: {
        id: string;
        description: string;
        totalAmount: number;
        installments: number;
        dayOfMonth: number;
    } | null;
};

export function PurchaseItem({
    id,
    description,
    amount,
    category,
    subscriptionId,
    installmentNumber,
    subscription,
    installmentPlan,
}: PurchaseItemProps) {
    const router = useRouter();

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
                    pathname: "/(out)/purchase/[id]",
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
                    <TextDefault style={styles.description}>
                            {category?.label || "Sem categoria"}
                            {subscriptionId ? " • Assinatura" : ""}
                            {installmentNumber ? ` • Parcela ${installmentNumber}/${installmentPlan?.installments || 0}` : ""}
                        </TextDefault>
                </View>
            </View>
            <TextDefault style={[styles.amount]}>
                {formatCurrency(amount)}
            </TextDefault>
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
});
