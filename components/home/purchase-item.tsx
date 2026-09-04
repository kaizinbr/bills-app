import { StyleSheet, View } from "react-native";
import TextDefault from "@/components/core/text-core";
import { formatCurrency } from "@/lib/format-currency";

type PurchaseItemProps = {
    description: string | null;
    amount: number;
};

export function PurchaseItem({ description, amount }: PurchaseItemProps) {
    return (
        <View style={styles.item}>
            <View style={{ flex: 1, marginRight: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 36, height: 36, backgroundColor: "#B3B3B3", borderRadius: 2999 }} />
                <TextDefault style={styles.description}>
                    {description || "Sem descrição"}
                </TextDefault>
            </View>
            <TextDefault style={[styles.amount, { fontFamily: "Jersey25_400Regular" }]}>
                {formatCurrency(amount)}
            </TextDefault>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        // paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
    description: {
        fontSize: 14,
        color: "#eee",
    },
    amount: {
        fontSize: 14,
        color: "#fff",
        fontWeight: 600,
    },
});