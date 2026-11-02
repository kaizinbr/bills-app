import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import TextDefault from "@/components/core/text-core";
import { PurchaseIcon } from "@/components/home/purchase-icon";
import { formatCurrency } from "@/lib/format-currency";
import type { DonutSegment } from "./category-donut";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type LegendPurchase = {
    id: string;
    description: string;
    amount: number | string;
    purchasedAt: string;
    category: { id: string };
};

type CategoryLegendProps = {
    segments: DonutSegment[];
    total: number;
    purchases: LegendPurchase[];
};

export function CategoryLegend({
    segments,
    total,
    purchases,
}: CategoryLegendProps) {
    // id da categoria aberta (só uma por vez)
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <View style={{ gap: 16 }}>
            {segments.map((segment) => {
                const percentage =
                    total > 0 ? (segment.value / total) * 100 : 0;

                // compras desta categoria, da mais nova para a mais antiga
                const categoryPurchases = purchases
                    .filter((p) => p.category.id === segment.id)
                    .sort(
                        (a, b) =>
                            new Date(b.purchasedAt).getTime() -
                            new Date(a.purchasedAt).getTime(),
                    );

                const count = categoryPurchases.length;
                const isOpen = openId === segment.id;

                return (
                    <View key={segment.id} style={styles.row}>
                        <Pressable
                            onPress={() =>
                                setOpenId(isOpen ? null : segment.id)
                            }
                            style={{ gap: 8 }}
                        >
                            <View style={styles.topLine}>
                                <View style={styles.labelGroup}>
                                    <PurchaseIcon
                                        categoryKey={segment.key}
                                        style={[
                                            styles.icon,
                                            { backgroundColor: segment.color },
                                        ]}
                                        iconSize={16}
                                    />
                                    <TextDefault
                                        style={styles.label}
                                        numberOfLines={1}
                                    >
                                        {segment.label}
                                    </TextDefault>
                                </View>
                                <TextDefault style={styles.percentText}>
                                    {count} compra{count !== 1 ? "s" : ""} ·{" "}
                                    {percentage.toFixed(0)}% {isOpen ? "▴" : "▾"}
                                </TextDefault>
                            </View>

                            <View style={styles.track}>
                                <View
                                    style={[
                                        styles.fill,
                                        {
                                            width: `${percentage}%`,
                                            backgroundColor: segment.color,
                                        },
                                    ]}
                                />
                            </View>
                        </Pressable>

                        {isOpen && (
                            <Animated.View style={styles.list} entering={FadeIn.duration(200)}>
                                {categoryPurchases.map((purchase) => (
                                    <View
                                        key={purchase.id}
                                        style={styles.purchaseRow}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <TextDefault
                                                style={styles.purchaseName}
                                                numberOfLines={1}
                                            >
                                                {purchase.description.trim()}
                                            </TextDefault>
                                            <TextDefault
                                                style={styles.purchaseDate}
                                            >
                                                {new Date(
                                                    purchase.purchasedAt,
                                                ).toLocaleDateString("pt-BR", {
                                                    timeZone:
                                                        "America/Sao_Paulo",
                                                })}
                                            </TextDefault>
                                        </View>
                                        <TextDefault
                                            style={styles.purchaseAmount}
                                        >
                                            {formatCurrency(
                                                Number(purchase.amount),
                                            )}
                                        </TextDefault>
                                    </View>
                                ))}
                            </Animated.View>
                        )}
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
    list: {
        backgroundColor: "#1B1C1D",
        borderRadius: 12,
        padding: 12,
    },
    purchaseRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
        paddingVertical: 8,

    },
    purchaseName: {
        color: "#eee",
        fontSize: 14,
    },
    purchaseDate: {
        color: "#B6B6B6",
        fontSize: 12,
    },
    purchaseAmount: {
        color: "#eee",
        fontSize: 14,
        fontWeight: "600",
    },
});