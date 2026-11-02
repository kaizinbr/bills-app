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
import { SaleSquareIcon } from '@solar-icons/react-native/linear/sale-square'
import { WalletIcon } from "@solar-icons/react-native/linear/wallet";
import { FileDownloadIcon } from '@solar-icons/react-native/linear/file-download'
import { DownloadMinimalisticIcon } from '@solar-icons/react-native/linear/download-minimalistic'

import { UsersGroupTwoRoundedIcon } from "@solar-icons/react-native/linear/users-group-two-rounded";
import Avatar, { AvatarGeneric } from "@/components/user/avatar";
import GroupMembers from "@/components/home/group-members";

type GroupsProps = {
    groupId: string | null;
    updatedAt: number | Date;
};

export type GroupsHandle = {
    loadMoreIfNeeded: () => void;
    refreshInvoiceData: () => void;
};

export function sortInvoicesDesc(invoices: Invoice[]): Invoice[] {
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
        const { data, refetch } = useGroups();

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
            // purchasesRefetch();
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
            refetch: purchasesRefetch,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading: purchasesLoading,
        } = useInvoicePurchases(selectedInvoice?.id ?? null);

        useEffect(() => {
            purchasesRefetch();
            console.log("atualizou as compras");
        }, [selectedInvoice?.id, purchasesRefetch]);

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
            <View style={[styles.container, { marginTop: insets.top + 80 }]}>
                <View style={{ paddingHorizontal: 24 }}>
                    <View style={styles.invoiceCard}>
                        <TextDefault style={styles.groupName} numberOfLines={1}>
                            Total da fatura:
                        </TextDefault>
                        <TextDefault style={[styles.invoiceValue]}>
                            {formatCurrency(totalData?.total)}
                        </TextDefault>
                        <View style={{ flexDirection: "column", gap: 8 }}>
                            <GroupMembers groupMembers={group.groupMembers} />
                            <TextDefault style={styles.invoiceClosingText}>
                                Fecha dia {group.closingDay}{" "}
                                {group.limit
                                    ? `• Limite mensal de ${formatCurrency(group.limit)}`
                                    : ""}
                            </TextDefault>
                        </View>
                    </View>
                </View>
                <ScrollView
                    contentContainerStyle={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        gap: 14,
                    }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
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
                                    padding: 16,
                                    width: width - 48,
                                    borderRadius: 18,
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
                                style={[styles.assetCard]}
                            >
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
                                    % <TextDefault style={{
                                        fontSize: 14,
                                        color: "#fff",
                                    }}>
                                        ({formatCurrency(totalData.total)} de {formatCurrency(group.limit)})
                                    </TextDefault>
                                </TextDefault>
                            </Pressable>
                        </LinearGradient>
                    )}
                </ScrollView>

                {/* credor, cartões e ações da conta */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.infoRow}
                >
                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: `/(options)/values/[invoiceId]`,
                                params: { invoiceId: selectedInvoiceId! },
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

                    <Pressable
                        onPress={() => {
                            router.push({
                                pathname: `/(out)/download/[groupId]`,
                                params: { groupId: group.id, invoiceId: selectedInvoiceId! },
                            });
                        }}
                        style={styles.buttons}
                    >
                        <View style={styles.itemIcon}>
                            <DownloadMinimalisticIcon size={20} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Exportar dados
                        </TextDefault>
                    </Pressable>

                    {/* <Pressable
                        onPress={() => {
                            router.push({
                                pathname: `/(options)/values/[invoiceId]`,
                                params: { invoiceId: selectedInvoiceId! },
                            });
                        }}
                        style={styles.buttons}
                    >
                        <View style={styles.itemIcon}>
                            <FileDownloadIcon size={20} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            Exportar dados
                        </TextDefault>
                    </Pressable> */}

                    <View style={styles.buttons}>
                        <View style={styles.itemIcon}>
                            <Bag3Icon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {totalPurchases} compra
                            {totalPurchases !== 1 ? "s" : ""}
                        </TextDefault>
                    </View>
                    <Pressable
                        style={styles.buttons}
                        onPress={() => {
                            router.navigate({
                                pathname: `/(options)/subscriptions/[groupId]`,
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
                            console.log("group", group.id);
                            router.push({
                                pathname: `/(options)/installments/[groupId]`,
                                params: { groupId: group.id },
                            });
                        }}
                    >
                        <View style={styles.itemIcon}>
                            <SaleSquareIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {group._count?.installmentPlans}{" "}
                            {group._count?.installmentPlans !== 1 ? "parcelamentos" : "parcelamento"}
                        </TextDefault>
                    </Pressable>

                    <Pressable
                        style={styles.buttons}
                        onPress={() => {
                            console.log("group", group.id);
                            router.push({
                                pathname: `/(tabs)/cards`,
                                params: { groupId: group.id },
                            });
                        }}
                    >
                        <View style={styles.itemIcon}>
                            <CardIcon size={24} color="white" />
                        </View>
                        <TextDefault style={styles.infoChipText}>
                            {group._count?.cards}{" "}
                            {group._count?.cards !== 1 ? "cartões" : "cartão"}
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
                {invoices.length > 0 && (
                    <InvoiceSelectMenu
                        invoices={invoices}
                        isSelected={!!selectedInvoice}
                        selectedInvoice={selectedInvoice}
                        setSelectedInvoiceId={setSelectedInvoiceId}
                    />
                )}

                {/* <View style={styles.infoRow}>
                    <TextDefault style={styles.updateText}>
                        Atualizado:{" "}
                        {new Date(updatedAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </TextDefault>
                </View> */}

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
                                groupId={group.id}
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
        marginTop: 64,
    },
    groupName: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "500",
    },
    invoiceCard: {
        // padding: 16,
        // borderRadius: 16,
        width: "100%",
        // aspectRatio: 5 / 2,
        justifyContent: "space-between",
        // backgroundColor: "rgba(40, 40, 40, 0.8)",
    },
    invoiceText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "500",
    },
    invoiceValue: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "900",
        // marginBottom: 16,
    },
    invoiceClosingText: {
        fontSize: 14,
        color: "#fff",

        fontWeight: "500",
    },
    assetCard: {
        justifyContent: "space-between",
    },
    assetText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "500",
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
        justifyContent: "center",
        textAlign: "center",
    },
    purchasesList: {
        // paddingHorizontal: 24,
        width: "100%",
        justifyContent: "flex-start",
        paddingBottom: 124,
    },
});
