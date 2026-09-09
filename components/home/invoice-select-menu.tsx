import { useAuth } from "@/components/core/auth-provider";
import Avatar, { AvatarNoPress } from "@/components/user/avatar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import TextDefault from "@/components/core/text-core";
import { useProfile } from "@/hooks/use-profile";

import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AltArrowDownIcon } from "@solar-icons/react-native/linear/alt-arrow-down";

import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { useInvoicePurchases } from "@/hooks/use-invoice-purchases";
import { useInvoiceTotal } from "@/hooks/use-invoice-total";
import { formatCurrency } from "@/lib/format-currency";

interface Group {
    id: string;
    name: string;
}
interface PopoverMenuData {
    creditorGroups?: Group[];
    debtorGroups?: Group[];
}

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

export default function InvoiceSelectMenu({
    invoices,
    isSelected,
    selectedInvoice,
    setSelectedInvoiceId,
}: {
    invoices: Invoice[];
    isSelected: boolean;
    selectedInvoice?: Invoice | null;
    setSelectedInvoiceId: (id: string) => void;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["80%", "100%"], []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    return (
        <>
            <Pressable
                onPress={handlePresentModalPress}
                style={styles.headerButton}
            >
                <TextDefault style={styles.headerButtonTitle} numberOfLines={1}>
                    {formatFaturaLabel(selectedInvoice!) ?? "Selecionar fatura"}
                </TextDefault>
                <AltArrowDownIcon size={12} color="#B6B6B6" />
            </Pressable>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // fecthData(true);
                }}
                snapPoints={snapPoints}
                backdropComponent={(backdropProps) => (
                    <BottomSheetBackdrop
                        {...backdropProps}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                    />
                )}
                enablePanDownToClose
                topInset={insets.top}
                backgroundStyle={{ backgroundColor: "#161718" }}
                handleIndicatorStyle={{ backgroundColor: "#555" }}
                enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <TextDefault style={styles.headerText}>
                            Selecione a fatura que deseja visualizar:
                        </TextDefault>
                        <View style={styles.menu}>
                            {invoices.map((invoice) => {
                                const isSelected =
                                    selectedInvoice?.id === invoice.id;
                                return (
                                    <Pressable
                                        key={invoice.id}
                                        onPress={() => {
                                            setSelectedInvoiceId(invoice.id);
                                            bottomSheetModalRef.current?.dismiss();
                                        }}
                                        style={[styles.options]}
                                    >
                                        <TextDefault
                                            style={[
                                                styles.optionsText,
                                                {
                                                    color: isSelected
                                                        ? "#fff"
                                                        : "#B3B3B3",
                                                },
                                            ]}
                                        >
                                            {formatFaturaLabel(invoice)}
                                        </TextDefault>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
}

const styles = StyleSheet.create({
    headerSlotLeft: {
        width: "33%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    headerButton: {
        maxWidth: "50%",
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 4,
    },
    headerButtonTitle: {
        flexShrink: 1,
        color: "#B6B6B6",
        fontSize: 12,
        // fontWeight: "600",
        textAlign: "center",
    },
    contentContainer: {
        flex: 1,
        padding: 0,
        alignItems: "center",
    },
    content: {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
    },
    headerText: {
        fontSize: 14,
        marginTop: 8,
        paddingHorizontal: 16,
    },
    menu: {
        width: "100%",
        flexDirection: "column",
        marginTop: 16,
    },
    options: {
        width: "100%",
        padding: 16,
        // borderBottomWidth: 0.5,
        // borderBottomColor: "#555",
    },
    optionsText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
});
