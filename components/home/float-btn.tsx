import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { AddIcon } from "@solar-icons/react-native/linear/add";
import { useRouter } from "expo-router";
import { useMemo, useRef, useCallback, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

import TextDefault from "@/components/core/text-core";

import { Bag3Icon } from "@solar-icons/react-native/linear/bag-3";
import { BagCheckIcon } from "@solar-icons/react-native/linear/bag-check";
import { CardIcon } from "@solar-icons/react-native/linear/card";
import { RefreshCircleIcon } from "@solar-icons/react-native/linear/refresh-circle";
import { UserCircleIcon } from "@solar-icons/react-native/linear/user-circle";
import { WalletIcon } from "@solar-icons/react-native/linear/wallet";

export default function CreatePurchase({
    selectedGroupId,
    floatbBtnTranslateY,
}: {
    selectedGroupId: string | null;
    floatbBtnTranslateY: any;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: invoicesData } = useGroupInvoices(selectedGroupId ?? "");

    const currentInvoice = useMemo(
        () =>
            invoicesData?.invoices.find(
                (inv: Invoice) => inv.status === "OPEN",
            ) ?? null,
        [invoicesData],
    );

    const floatButtonScale = floatbBtnTranslateY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.2],
        extrapolate: "clamp",
    });

    const snapPoints = useMemo(() => ["80%", "100%"], []);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const [internalOpen, setInternalOpen] = useState(false);

    // só aqui, depois de TODOS os hooks
    if (!selectedGroupId || !currentInvoice) return null;

    return (
        <>
            <Animated.View
                style={[
                    {
                        transform: [
                            { translateY: floatbBtnTranslateY },
                            { scaleX: floatButtonScale },
                            { scaleY: floatButtonScale },
                        ],
                        position: "absolute",
                        bottom: insets.bottom + 16,
                        right: 16,
                        zIndex: 1000,
                    },
                ]}
            >
                <Pressable
                    onPress={() =>
                        router.push(
                            `/create-purchase?groupId=${selectedGroupId}&invoiceId=${currentInvoice.id}&purchaseId=null`,
                        )
                    }
                    onLongPress={handlePresentModalPress}
                    style={({ pressed }) => [
                        styles.container,
                        {
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            backgroundColor: pressed ? "#007B5E" : "#00C89B",
                        },
                    ]}
                >
                    <AddIcon size={28} color="#ffffff" strokeWidth={3} />
                </Pressable>
            </Animated.View>

            <BottomSheetModal
                ref={bottomSheetModalRef}
                onChange={handleSheetChanges}
                // onDismiss={() => {
                //     refetch();
                // }}
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
                // enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <Pressable
                            style={styles.options}
                            onPress={() => {
                                router.push(
                                    `/create-purchase?groupId=${selectedGroupId}&invoiceId=${currentInvoice.id}&purchaseId=null`,
                                );
                                bottomSheetModalRef.current?.dismiss();
                            }}
                        >
                            <Bag3Icon size={24} color="#fff" />
                            <TextDefault style={styles.optionsText}>
                                Criar compra
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            style={styles.options}
                            onPress={() => {
                                router.push(
                                    `/create-subscription?groupId=${selectedGroupId}`,
                                );
                                bottomSheetModalRef.current?.dismiss();
                            }}
                        >
                            <RefreshCircleIcon size={24} color="white" />
                            <TextDefault style={styles.optionsText}>
                                Criar assinatura
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            style={styles.options}
                            onPress={() => {
                                router.push(
                                    `/create-card?groupId=${selectedGroupId}&invoiceId=${currentInvoice.id}&purchaseId=null`,
                                );
                                bottomSheetModalRef.current?.dismiss();
                            }}
                        >
                            <WalletIcon size={24} color="white" />
                            <TextDefault style={styles.optionsText}>
                                Criar Cartão
                            </TextDefault>
                        </Pressable>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#00C89B",
        padding: 12,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1000,
    },
    contentContainer: {
        flex: 1,
        padding: 0,
        paddingVertical: 24,
        paddingBottom: 64,
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
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: "#555",
        paddingVertical: 8,
        width: "100%",
    },
    menu: {
        width: "100%",
        flexDirection: "column",
        // marginTop: 16,
    },
    options: {
        width: "100%",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: "#555",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    optionsText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
});
