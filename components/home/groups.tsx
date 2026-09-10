// components/home/groups.tsx
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import TextDefault from "@/components/core/text-core";
import { useGroups } from "@/hooks/use-group";
import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { useInvoicePurchases } from "@/hooks/use-invoice-purchases";
import { useInvoiceTotal } from "@/hooks/use-invoice-total";
import { formatCurrency } from "@/lib/format-currency";
import { groupPurchasesByDate } from "@/lib/group-purchases-by-date";
import { PurchaseSection } from "@/components/home/purchase-section";

import { CardIcon } from "@solar-icons/react-native/linear/card";
import { WalletIcon } from "@solar-icons/react-native/linear/wallet";
import { BagCheckIcon } from "@solar-icons/react-native/linear/bag-check";
import { Bag3Icon } from "@solar-icons/react-native/linear/bag-3";
import { UserCircleIcon } from "@solar-icons/react-native/linear/user-circle";
import { RefreshCircleIcon } from "@solar-icons/react-native/linear/refresh-circle";
import InvoicesCarousel from "@/components/home/invoices-carousel";
import InvoiceSelectMenu from "@/components/home/invoice-select-menu";

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

const Groups = forwardRef<GroupsHandle, GroupsProps>(
    ({ groupId, updatedAt }, ref) => {
        const router = useRouter();
        const queryClient = useQueryClient();
        const { data } = useGroups();

        const { width, height } = useWindowDimensions();
        const insets = useSafeAreaInsets();

        const group = useMemo(() => {
            if (!data || !groupId) return null;
            return (
                [...data.creditorGroups, ...data.debtorGroups].find(
                    (g) => g.id === groupId,
                ) ?? null
            );
        }, [data, groupId]);
        // console.log(group)

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
            isLoading: purchasesLoading,
        } = useInvoicePurchases(selectedInvoice?.id ?? null);

        const purchases = useMemo(
            () => purchasesData?.pages.flatMap((page) => page.purchases) ?? [],
            [purchasesData],
        );

        const totalPurchases = purchasesData?.pages[0]?.pagination.total ?? 0;

        const sections = useMemo(
            () => groupPurchasesByDate(purchases),
            [purchases],
        );

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

        const canCreateInSelected = selectedInvoice?.status === "OPEN";

        return (
            <View style={styles.container}>
                <View style={styles.infoRow}>
                    <InvoiceSelectMenu
                        invoices={invoices}
                        isSelected={!!selectedInvoice}
                        selectedInvoice={selectedInvoice}
                        setSelectedInvoiceId={setSelectedInvoiceId}
                    />
                    <TextDefault style={styles.updateText}>
                        Atualizado:{" "}
                        {new Date(updatedAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </TextDefault>
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                    <LinearGradient
                        colors={["#00C89B", "#0B3D22"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.groupCard}
                    >
                        <TextDefault style={styles.groupName}>
                            Total da conta {group.name}:
                        </TextDefault>
                        <TextDefault style={[styles.groupValue]}>
                            {formatCurrency(totalData?.total)}
                        </TextDefault>
                        <TextDefault style={styles.groupClosing}>
                            {selectedInvoice
                                ? `Fecha ${new Date(selectedInvoice.closingDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`
                                : `Fecha dia ${group.closingDay}`}
                        </TextDefault>
                    </LinearGradient>
                </View>

                {/* credor, cartões e ações da conta */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.infoRow}
                >
                    <View style={styles.buttons}>
                        <UserCircleIcon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            Pagar a: {group.debtor?.name}
                        </TextDefault>
                    </View>

                    <View style={styles.buttons}>
                        <Bag3Icon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            {totalPurchases} compras
                        </TextDefault>
                    </View>
                    <Pressable style={styles.buttons}
                        onPress={() => {
                            router.push({
                                pathname: `/(tabs)/subscriptions/[groupId]`,
                                params: { groupId: group.id },
                            });
                        }}
                    >
                        <Bag3Icon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            {group._count?.subscriptions} assinatura{group._count?.subscriptions !== 1 ? "s" : ""}
                        </TextDefault>
                    </Pressable>

                    {group.cards?.map((card: any) => (
                        <Pressable
                            key={card.id}
                            style={[
                                styles.buttons,
                                {
                                    backgroundColor: card.color || "#282828",
                                    aspectRatio: 5 / 3,
                                },
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: `/card/[id]`,
                                    params: { id: card.id },
                                })
                            }
                        >
                            <CardIcon size={24} color="white" />
                            <TextDefault style={styles.infoChipText}>
                                {card.name}
                            </TextDefault>
                        </Pressable>
                    ))}

                    <Pressable
                        onPress={() =>
                            router.push(
                                `/create-card?groupId=${group.id}&invoiceId=${selectedInvoice?.id}&purchaseId=null`,
                            )
                        }
                        style={styles.buttons}
                    >
                        <WalletIcon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            Criar cartão
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        disabled={!selectedInvoice || !canCreateInSelected}
                        onPress={() =>
                            router.push(
                                `/purchase-edit?groupId=${group.id}&invoiceId=${selectedInvoice?.id}&purchaseId=null`,
                            )
                        }
                        style={[
                            styles.buttons,
                            !canCreateInSelected && styles.infoChipDisabled,
                        ]}
                    >
                        <BagCheckIcon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            Criar compra
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push(
                                `/create-subscription?groupId=${group.id}`,
                            )
                        }
                        style={styles.buttons}
                    >
                        <RefreshCircleIcon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            Criar assinatura
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/create-group",
                                params: { groupId: group.id },
                            })
                        }
                        style={styles.buttons}
                    >
                        <BagCheckIcon size={24} color="white" />
                        <TextDefault style={styles.infoChipText}>
                            Editar conta
                        </TextDefault>
                    </Pressable>
                </ScrollView>

                <View
                    style={[
                        styles.purchasesList,
                        { minHeight: height - insets.top - insets.bottom - 32 },
                    ]}
                >
                    {purchasesLoading ? (
                        <ActivityIndicator
                            size="small"
                            color="#B3B3B3"
                            style={{ marginTop: 12 }}
                        />
                    ) : (
                        sections.map((section) => (
                            <PurchaseSection
                                key={section.date}
                                date={section.date}
                                purchases={section.purchases}
                            />
                        ))
                    )}

                    {isFetchingNextPage && (
                        <ActivityIndicator
                            size="small"
                            color="#B3B3B3"
                            style={{ marginVertical: 16 }}
                        />
                    )}
                </View>
            </View>
        );
    },
);

export default Groups;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 16,
    },
    groupCard: {
        padding: 16,
        borderRadius: 16,
        width: "100%",
        aspectRatio: 5 / 3,
        justifyContent: "flex-end",
    },
    groupName: {
        fontSize: 14,
        color: "#fff",
    },
    groupValue: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "800",
    },
    groupClosing: {
        fontSize: 14,
        color: "#eaeaea",
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
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
        // paddingHorizontal: 16,
        width: "100%",
        justifyContent: "flex-start",
    },
});
