// components/home/groups.tsx
import TextDefault from "@/components/core/text-core";
import { type Invoice } from "@/hooks/use-group-invoices";
import { formatCurrency } from "@/lib/format-currency";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseUpIcon } from "@solar-icons/react-native/linear/course-up";
import { useIncomesFromInvoice } from "@/hooks/use-income-total";

type GroupsProps = {
    groupId: string | null;
    updatedAt: number | Date;
};

export type GroupsHandle = {
    loadMoreIfNeeded: () => void;
    refreshInvoiceData: () => void;
};

function sortInvoicesDesc(invoices: Invoice[]): Invoice[] {
    return [...invoices].sort(
        (a, b) =>
            new Date(a.periodStart).getTime() -
            new Date(b.periodStart).getTime(),
    );
}

function formatFaturaLabel(invoice: Invoice): string {
    const closing = new Date(invoice.closingDate);
    const closingLabel = closing.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });

    if (invoice.status === "OPEN") return "Fatura atual";
    if (invoice.status === "PAID") return `Paga ${closingLabel}`;
    return `Fechada ${closingLabel}`;
}

export default function Incomes({ invoiceId }: { invoiceId: string | null }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } =
        useIncomesFromInvoice(invoiceId);
    // console.log("Incomes data:", invoiceId, data);

    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
                    colors={["#8C85F7", "#413CA4"]}
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
                style={[
                    styles.assetCard,
                    {
                        width: "100%",
                        padding: 16,
                    },
                ]}
                onPress={() => {
                    router.push({
                        pathname: "/incomes/[invoiceId]",
                        params: { invoiceId: invoiceId ?? "" },
                    });
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                                alignItems: "center",
                    }}
                >
                    <View>
                        <TextDefault style={styles.assetText} numberOfLines={1}>
                            Entradas do mês
                        </TextDefault>
                        <TextDefault style={[styles.assetValue]}>
                            {formatCurrency(data?.total ?? 0)}
                        </TextDefault>
                    </View>
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center", 
                        }}
                    >
                        <CourseUpIcon size={24} color="#fff" strokeWidth={3} />
                    </View>
                </View>
            </Pressable>
        </LinearGradient>
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
