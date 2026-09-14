import TextDefault from "@/components/core/text-core";
import { useGroups } from "@/hooks/use-group";
import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { useInvoicePurchases } from "@/hooks/use-invoice-purchases";
import { useInvoiceTotal } from "@/hooks/use-invoice-total";
import { formatCurrency } from "@/lib/format-currency";
import { colorForIndex } from "@/lib/category-colors";
import { useQueryClient } from "@tanstack/react-query";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { StyleSheet, View } from "react-native";

import InvoiceSelectMenu from "@/components/home/invoice-select-menu";
import {
    CategoryDonut,
    type DonutSegment,
} from "@/components/charts/category-donut";
import { CategoryLegend } from "@/components/charts/category-legend";

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
            new Date(b.periodStart).getTime() -
            new Date(a.periodStart).getTime(),
    );
}

const Charts = forwardRef<GroupsHandle, GroupsProps>(
    ({ groupId, updatedAt }, ref) => {
        const queryClient = useQueryClient();
        const { data } = useGroups();

        const group = useMemo(() => {
            if (!data || !groupId) return null;
            return data.groups.find((g) => g.id === groupId) ?? null;
        }, [data, groupId]);

        const { data: invoicesData } = useGroupInvoices(groupId ?? "");
        const invoices = useMemo(
            () => sortInvoicesDesc(invoicesData?.invoices ?? []),
            [invoicesData],
        );

        const currentInvoice = useMemo(
            () =>
                invoices.find((inv) => inv.status === "OPEN") ??
                invoices[0] ??
                null,
            [invoices],
        );

        const [selectedInvoiceId, setSelectedInvoiceId] = useState<
            string | null
        >(null);

        useEffect(() => {
            setSelectedInvoiceId(null);
        }, [groupId]);

        const selectedInvoice = useMemo(() => {
            if (selectedInvoiceId) {
                return (
                    invoices.find((inv) => inv.id === selectedInvoiceId) ??
                    currentInvoice
                );
            }
            return currentInvoice;
        }, [invoices, selectedInvoiceId, currentInvoice]);

        const { data: totalData } = useInvoiceTotal(
            selectedInvoice?.id ?? null,
        );

        const {
            data: purchasesData,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
        } = useInvoicePurchases(selectedInvoice?.id ?? null);

        // mesma queryKey usada pela lista de compras do Home — reaproveita o
        // cache já carregado ali, sem disparar requisição extra
        const purchases = useMemo(
            () => purchasesData?.pages.flatMap((page) => page.purchases) ?? [],
            [purchasesData],
        );

        const totalPurchases = purchasesData?.pages[0]?.pagination.total ?? 0;

        const categoryBreakdown: DonutSegment[] = useMemo(() => {
            const totals = new Map<
                string,
                { key: string; label: string; value: number }
            >();

            for (const purchase of purchases) {
                const mapKey = purchase.category.id;
                const current = totals.get(mapKey) ?? {
                    key: purchase.category.key,
                    label: purchase.category.label,
                    value: 0,
                };
                current.value += Number(purchase.amount);
                totals.set(mapKey, current);
            }

            return Array.from(totals.entries())
                .map(([id, { key, label, value }], index) => ({
                    id,
                    key,
                    label,
                    value,
                    color: colorForIndex(index),
                }))
                .sort((a, b) => b.value - a.value);
        }, [purchases]);

        useImperativeHandle(ref, () => ({
            loadMoreIfNeeded: () => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            },
            refreshInvoiceData: () => {
                if (!groupId) return;
                queryClient.invalidateQueries({
                    queryKey: ["group", groupId, "invoices"],
                });
                if (selectedInvoice?.id) {
                    queryClient.invalidateQueries({
                        queryKey: ["invoice", selectedInvoice.id, "purchases"],
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["invoice", selectedInvoice.id, "total"],
                    });
                }
            },
        }));

        if (!group) return null;

        return (
            <View style={styles.container}>
                <View style={styles.infoRow}>
                    {invoices.length > 0 && (
                        <InvoiceSelectMenu
                            invoices={invoices}
                            isSelected={!!selectedInvoice}
                            selectedInvoice={selectedInvoice}
                            setSelectedInvoiceId={setSelectedInvoiceId}
                        />
                    )}
                    <TextDefault style={styles.updateText}>
                        Atualizado:{" "}
                        {new Date(updatedAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </TextDefault>
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <View style={styles.groupCard}>
                        <View
                            style={{ alignItems: "center" }}
                        >
                            <CategoryDonut
                                segments={categoryBreakdown}
                                centerLabel={formatCurrency(totalData?.total)}
                                centerSubLabel={`${totalPurchases} compra${totalPurchases !== 1 ? "s" : ""}`}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 16, marginBottom: 16, paddingTop: 16 }}>
                    {categoryBreakdown.length > 0 ? (
                        <CategoryLegend
                            segments={categoryBreakdown}
                            total={Number(totalData?.total ?? 0)}
                        />
                    ) : (
                        <TextDefault
                            style={{ color: "#888", textAlign: "center" }}
                        >
                            Nenhuma compra nesta fatura ainda.
                        </TextDefault>
                    )}
                </View>
            </View>
        );
    },
);

export default Charts;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 16,
    },
    groupCard: {
        // padding: 16,
        // borderRadius: 16,
        width: "100%",
        // backgroundColor: "#142825",
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
        justifyContent: "space-between",
        alignItems: "center",
    },
    updateText: {
        color: "#B6B6B6",
        fontSize: 12,
    },
});
