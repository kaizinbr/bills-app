import { View, StyleSheet } from "react-native";
import TextDefault from "@/components/core/text-core";
import { PurchaseIcon } from "@/components/home/purchase-icon";
import { formatCurrency } from "@/lib/format-currency";
import type { DonutSegment } from "./category-donut";

type CategoryLegendProps = {
    segments: DonutSegment[];
    total: number;
};

export function CategoryLegend({ segments, total }: CategoryLegendProps) {
    return (
        <View style={{ gap: 16 }}>
            {segments.map((segment) => {
                const percentage = total > 0 ? (segment.value / total) * 100 : 0;

                return (
                    <View key={segment.id} style={styles.row}>
                        <View style={styles.topLine}>
                            <View style={styles.labelGroup}>
                                <PurchaseIcon categoryKey={segment.key} style={[styles.icon, { backgroundColor: segment.color }]} iconSize={16} />
                                <TextDefault style={styles.label} numberOfLines={1}>
                                    {segment.label}
                                </TextDefault>
                            </View>
                            <TextDefault style={styles.percentText}>
                                {percentage.toFixed(0)}%
                            </TextDefault>
                        </View>

                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.fill,
                                    { width: `${percentage}%`, backgroundColor: segment.color },
                                ]}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { gap: 8 },
    topLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    labelGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    icon: { width: 28, height: 28 },
    label: {
        color: "#eee",
        fontSize: 14,
        fontWeight: "600",
        flexShrink: 1,
    },
    percentText: {
        color: "#B6B6B6",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
    },
    track: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "#232323",
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: 999,
    },
});