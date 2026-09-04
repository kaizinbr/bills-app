import { StyleSheet, View } from "react-native";
import TextDefault from "@/components/core/text-core";
import type { Purchase } from "@/hooks/use-group-purchases";
import { formatSectionDate } from "@/lib/format-section-date";
import { PurchaseItem } from "./purchase-item";

type PurchaseSectionProps = {
    date: string;
    purchases: Purchase[];
};

export function PurchaseSection({ date, purchases }: PurchaseSectionProps) {
    return (
        <View>
            <TextDefault style={styles.header}>
                {formatSectionDate(date)}
            </TextDefault>

            {purchases.map((purchase) => (
                <PurchaseItem
                    key={purchase.id}
                    description={purchase.description}
                    amount={purchase.amount}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 12,
        fontWeight: "600",
        color: "#B3B3B3",
        textTransform: "uppercase",
        paddingTop: 20,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
});