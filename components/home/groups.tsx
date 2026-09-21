// components/home/groups.tsx
import TextDefault from "@/components/core/text-core";
import { PurchaseSection } from "@/components/home/purchase-section";
import { useGroups } from "@/hooks/use-group";
import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { useInvoicePurchases } from "@/hooks/use-invoice-purchases";
import { useInvoiceTotal } from "@/hooks/use-invoice-total";
import { formatCurrency } from "@/lib/format-currency";
import { groupPurchasesByDate } from "@/lib/group-purchases-by-date";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

import Incomes from "@/components/home/incomes";
import InvoiceSelectMenu from "@/components/home/invoice-select-menu";
import { Bag3Icon } from "@solar-icons/react-native/linear/bag-3";
import { BagCheckIcon } from "@solar-icons/react-native/linear/bag-check";
import { CardIcon } from "@solar-icons/react-native/linear/card";
import { RefreshCircleIcon } from "@solar-icons/react-native/linear/refresh-circle";
import { UserCircleIcon } from "@solar-icons/react-native/linear/user-circle";
import { WalletIcon } from "@solar-icons/react-native/linear/wallet";

import { UsersGroupTwoRoundedIcon } from "@solar-icons/react-native/linear/users-group-two-rounded";

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

const Groups = forwardRef<GroupsHandle, GroupsProps>(
    ({ groupId, updatedAt }, ref) => {
        const router = useRouter();
        const queryClient = useQueryClient();
        const { data } = useGroups();

        const { width, height } = useWindowDimensions();
        const insets = useSafeAreaInsets();

        const group = useMemo(() => {
            if (!data || !groupId) return null;
            return data.groups.find((g) => g.id === groupId) ?? null;
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
        >(currentInvoice?.id);

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
            setSelectedInvoiceId(currentInvoice?.id ?? null);
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
            () =>
                groupPurchasesByDate(
                    purchases as Parameters<typeof groupPurchasesByDate>[0],
                ),
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
                <View style={{ paddingHorizontal: 24 }}>
                    <LinearGradient
                        colors={["#00C89B", "#0B3D22"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.invoiceCard}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <TextDefault
                                style={styles.invoiceText}
                                numberOfLines={1}
                            >
                                {group.name}
                            </TextDefault>
                            <TextDefault
                                style={styles.invoiceText}
                                numberOfLines={1}
                            >
                                {group.members?.length} membro
                                {group.members?.length !== 1 ? "s" : ""}
                            </TextDefault>
                        </View>
                        {/* <TextDefault style={styles.groupName} numberOfLines={1}>
                            Total da conta {group.name}:
                        </TextDefault> */}
                        <View>
                            <TextDefault style={[styles.invoiceValue]}>
                                {formatCurrency(totalData?.total)}
                            </TextDefault>
                            <TextDefault style={styles.invoiceClosingText}>
                                Fecha dia {group.closingDay}{" "}
                                {group.limit
                                    ? `• Limite ${formatCurrency(group.limit)}`
                                    : ""}
                            </TextDefault>
                        </View>
                    </LinearGradient>
                </View>
                <View
                    style={{
                        paddingHorizontal: 24,
                        gap: 14,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    {selectedInvoiceId && (
                        <Incomes invoiceId={selectedInvoiceId} />
                    )}
                    {Number(group.limit) > 0 && totalData?.total != null && (
                        <LinearGradient
                            colors={["#8C85F7", "#413CA4"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                {
                                    width: (width - 64) / 2,
                                    borderRadius: 16,
                                },
                            ]}
                        >
                            <Pressable style={[styles.assetCard]}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <TextDefault
                                        style={styles.assetText}
                                        numberOfLines={1}
                                    >
                                        Uso do limite
                                    </TextDefault>
                                </View>
                                <TextDefault style={[styles.assetValue]}>
                                    {(
                                        (totalData.total /
                                            Number(group.limit)) *
                                        100
                                    )
                                        .toFixed(0)
                                        .replace(".", ",")}
                                    %
                                </TextDefault>
                            </Pressable>
                        </LinearGradient>
                    )}
                </View>

                {/* credor, cartões e ações da conta */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.infoRow}
                >
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: `/(tabs)/values/[invoiceId]`,
                                params: { invoiceId: selectedInvoiceId },
                            });
                        }}
                        style={styles.buttons}
                    >
                        <View style={styles.itemIcon}>
                            <UsersGroupTwoRoundedIcon size={20} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Distinção de valores
                        </TextDefault>
                    </Pressable>

                    <View style={styles.buttons}>
                        <View style={styles.itemIcon}>
                            <Bag3Icon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {totalPurchases} compras
                        </TextDefault>
                    </View>
                    <Pressable
                        style={styles.buttons}
                        onPress={() => {
                            router.push({
                                pathname: `/(tabs)/subscriptions/[groupId]`,
                                params: { groupId: group.id },
                            });
                        }}
                    >
                        <View style={styles.itemIcon}>
                            <Bag3Icon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {group._count?.subscriptions} assinatura
                            {group._count?.subscriptions !== 1 ? "s" : ""}
                        </TextDefault>
                    </Pressable>
                    <Pressable
                        style={styles.buttons}
                        onPress={() => {
                            router.push({
                                pathname: `/(tabs)/cards/[groupId]`,
                                params: { groupId: group.id },
                            });
                        }}
                    >
                        <View style={styles.itemIcon}>
                            <CardIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {group._count?.cards} cartões
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push(
                                `/create-card?groupId=${group.id}&invoiceId=${selectedInvoice?.id}&purchaseId=null`,
                            )
                        }
                        style={styles.buttons}
                    >
                        <View style={styles.itemIcon}>
                            <WalletIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Adicionar cartão
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        disabled={!selectedInvoice || !canCreateInSelected}
                        onPress={() =>
                            router.push(
                                `/create-purchase?groupId=${group.id}&invoiceId=${selectedInvoice?.id}&purchaseId=null`,
                            )
                        }
                        style={[
                            styles.buttons,
                            !canCreateInSelected && styles.infoChipDisabled,
                        ]}
                    >
                        <View style={styles.itemIcon}>
                            <BagCheckIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Adicionar compra
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
                        <View style={styles.itemIcon}>
                            <RefreshCircleIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Adicionar assinatura
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
        padding: 16,
        borderRadius: 16,
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
        gap: 16,
        paddingHorizontal: 24,
        justifyContent: "space-between",
        alignItems: "flex-start",
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
    updateText: {
        color: "#B6B6B6",
        fontSize: 12,
        // fontWeight: "600",
        wordWrap: "",
    },
    buttons: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        maxWidth: 58,
        textAlign: "center",
    },
    itemIcon: {
        padding: 16,
        borderRadius: 999,
        width: 58,
        height: 58,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#282828",
    },
    infoChipText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    purchasesList: {
        // paddingHorizontal: 24,
        width: "100%",
        justifyContent: "flex-start",
    },
});
