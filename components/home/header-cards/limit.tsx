// components/home/groups.tsx
import TextDefault from "@/components/core/text-core";
import { type Invoice } from "@/hooks/use-group-invoices";
import { formatCurrency } from "@/lib/format-currency";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LockIcon } from "@solar-icons/react-native/linear/lock";
import { useIncomesFromInvoice } from "@/hooks/use-income-total";
import Svg, { Circle } from "react-native-svg";

export default function LimitCard({
    group,
    totalData,
}: {
    group: any;
    totalData: any;
}) {
    const router = useRouter();

    const { width, height } = useWindowDimensions();

    const size = 32;
    const strokeWidth = 3;
    const limit = Number(group.limit);

    const used = totalData?.total ?? 0;

    // porcentagem usada, de 0 a 100 (acima de 100 o círculo só fica cheio)
    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

    // o traço é desenhado centralizado na linha do círculo, então
    // o raio precisa descontar metade da espessura, senão a borda é cortada
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // quanto do círculo fica "vazio" (escondido)
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <>
            {Number(group.limit) > 0 && totalData?.total != null && (
                <LinearGradient
            colors={["#4FB2B9", "#0C737D"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        {
                            width: width - 48,
                            borderRadius: 22,
                        },
                    ]}
                >
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: `/(tabs)/chart`,
                                // params: { invoiceId: selectedInvoiceId! },
                            });
                        }}
                        style={[
                            styles.assetCard,

                            {
                                padding: 16,
                            },
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <View>
                                <TextDefault
                                    style={styles.assetText}
                                    numberOfLines={1}
                                >
                                    Uso do limite
                                </TextDefault>
                                <TextDefault style={[styles.assetValue]}>
                                    {(
                                        (totalData.total /
                                            Number(group.limit)) *
                                        100
                                    )
                                        .toFixed(0)
                                        .replace(".", ",")}
                                    %{" "}
                                    <TextDefault
                                        style={{
                                            fontSize: 14,
                                            color: "#fff",
                                        }}
                                    >
                                        ({formatCurrency(totalData.total)} de{" "}
                                        {formatCurrency(group.limit)})
                                    </TextDefault>
                                </TextDefault>
                            </View>

                            <View
                                style={{
                                    width: size,
                                    height: size,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Svg width={size} height={size}>
                                    {/* círculo de fundo */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="#232323"
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                    />

                                    {/* círculo da frente: mostra só a parte usada */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke={
                                            used > limit ? "#FF4D4D" : "#A6FFEC"
                                        }
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        // começa no topo em vez da direita
                                        rotation={-90}
                                        origin={`${size / 2}, ${size / 2}`}
                                    />
                                </Svg>
                            </View>
                        </View>
                    </Pressable>
                </LinearGradient>
            )}
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 16,
    },
    invoiceCard: {
        padding: 16,
        borderRadius: 16,
        width: "100%",
        aspectRatio: 5 / 2,
        justifyContent: "space-between",
    },
    invoiceText: {
        fontSize: 14,
        color: "#fff",
    },
    invoiceValue: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "800",
        marginBottom: 16,
    },
    invoiceClosingText: {
        fontSize: 14,
        color: "#eaeaea",
    },
    assetCard: {
        justifyContent: "space-between",
    },
    assetText: {
        fontSize: 14,
        color: "#fff",
    },
    assetValue: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "800",
    },
    assetClosingText: {
        fontSize: 14,
        color: "#eaeaea",
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 24,
        justifyContent: "space-between",
    },
    infoChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#282828",
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    infoChipSelected: {
        backgroundColor: "#009C7A",
    },
    infoChipDisabled: {
        opacity: 0.4,
    },
    infoChipText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    updateText: {
        color: "#B6B6B6",
        fontSize: 12,
        // fontWeight: "600",
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
    purchasesList: {
        // paddingHorizontal: 24,
        width: "100%",
        justifyContent: "flex-start",
    },
});
