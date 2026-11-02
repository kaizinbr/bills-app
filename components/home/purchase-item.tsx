import TextDefault from "@/components/core/text-core";
import { formatCurrency } from "@/lib/format-currency";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { PurchaseIcon } from "@/components/home/purchase-icon";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EditPurchaseBottomSheet from "@/components/purchases/edit-purchase-bottomsheet";
import api from "@/lib/api";
import { useGroups } from "@/hooks/use-group";

type PurchaseItemProps = {
    id: string;
    description: string | null;
    amount: number;
    purchasedAt: string | null;
    invoiceId: string | null;
    cardId: string | null;
    userId: string | null;
    installmentPlanId: string | null;
    installmentNumber: number | null;
    subscriptionId: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
    category: {
        id: string;
        key: string;
        label: string;
        icon: string | null;
    } | null;
    subscription: {
        id: string;
        name: string;
        description: string | null;
    };
    installmentPlan: {
        id: string;
        description: string;
        totalAmount: number;
        installments: number;
        dayOfMonth: number;
    } | null;
    invoice: {
        id: string;
        description: string;
    } | null;
    groupId: string;
};

export function PurchaseItem({
    id,
    description,
    amount,
    category,
    subscriptionId,
    installmentNumber,
    subscription,
    installmentPlan,
    purchasedAt,
    cardId,
    invoice,
    invoiceId,
    userId,
    groupId,
}: PurchaseItemProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data, refetch, isFetching } = useGroups();

    const [error, setError] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeletePurchase = async () => {
        try {
            const response = await api.delete(`/purchases/${id}`);
            console.log("Purchase deleted:", response.data.purchase);
            setShowDeleteModal(false);
            // router.back();
            refetch();
        } catch (error) {
            console.error("Error deleting purchase:", error);
            setError("Erro ao excluir a compra.");
        }
    };

    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const bottomSheetEditModalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ["80%", "100%"], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.close();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    return (
        <>
            <Pressable
                style={({ pressed }) => [
                    {
                        backgroundColor: pressed ? "#282828" : "#161718",
                    },
                    styles.item,
                ]}
                onPress={() => {
                    router.push({
                        pathname: "/(out)/purchase/[id]",
                        params: { id: id },
                    });
                }}
                onLongPress={handlePresentModalPress}
            >
                <View
                    style={{
                        flex: 1,
                        marginRight: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <PurchaseIcon categoryKey={category?.key} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <TextDefault style={styles.title}>
                            {description || category?.label || "Sem descrição"}
                        </TextDefault>
                        <TextDefault style={styles.description}>
                            {category?.label || "Sem categoria"}
                            {subscriptionId ? " • Assinatura" : ""}
                            {installmentNumber
                                ? ` • Parcela ${installmentNumber}/${installmentPlan?.installments || 0}`
                                : ""}
                        </TextDefault>
                    </View>
                </View>
                <TextDefault style={[styles.amount]}>
                    {formatCurrency(amount)}
                </TextDefault>
            </Pressable>

            {error && (
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <TextDefault
                            style={{ color: "#fff", textAlign: "center" }}
                        >
                            {error}
                        </TextDefault>
                    </View>
                </View>
            )}

            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    // setShowDatePicker(false);
                }}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => {
                        // setShowDatePicker(false);
                        setShowDeleteModal(false);
                    }}
                >
                    <View
                        style={styles.modalBox}
                        onStartShouldSetResponder={() => true}
                    >
                        <TextDefault
                            style={{
                                color: "#fff",
                                textAlign: "center",
                                fontWeight: "700",
                                fontSize: 16,
                                width: "100%",
                            }}
                        >
                            Tem certeza que deseja excluir esta compra?
                        </TextDefault>
                        <Pressable
                            onPress={() => {
                                setShowDeleteModal(false);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                                width: "48%",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Cancelar
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                handleDeletePurchase();
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#BE1E1E",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                                width: "48%",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Excluir
                            </TextDefault>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <BottomSheetModal
                ref={bottomSheetModalRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // fecthData(true);
                }}
                // snapPoints={snapPoints}
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
                enableDynamicSizing={true}
                snapPoints={snapPoints}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <View style={styles.menu}>
                            <Pressable
                                style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    bottomSheetEditModalRef.current?.present();
                                }}
                            >
                                <TextDefault>Editar compra</TextDefault>
                            </Pressable>
                            <Pressable
                                style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    setShowDeleteModal(true);
                                }}
                            >
                                <TextDefault>Excluir compra</TextDefault>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
            <BottomSheetModal
                ref={bottomSheetEditModalRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // fecthData(true);
                }}
                // snapPoints={snapPoints}
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
                enableDynamicSizing={true}
                snapPoints={snapPoints}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <EditPurchaseBottomSheet
                        initialData={{
                            id,
                            description,
                            amount,
                            categoryId: category?.id || null,
                            subscriptionId,
                            installmentNumber,
                            subscription,
                            installmentPlan,
                            purchasedAt,
                            cardId,
                            invoiceId,
                            userId,
                            invoice,
                        }}
                        onFinish={() => {
                            refetch();
                            bottomSheetEditModalRef.current?.dismiss();
                        }}
                        groupId={groupId}
                    />
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
    title: {
        fontSize: 14,
        color: "#eee",
    },
    description: {
        fontSize: 12,
        color: "#aaa",
    },
    amount: {
        fontSize: 14,
        color: "#fff",
        fontWeight: 600,
    },
    section: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 4,
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
    },
    icon: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#212223",
        // backgroundColor: "#212223",
        // borderRadius: 12,
        color: "#eeeeee",
        fontFamily: "ana",
        fontWeight: 400,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalBox: {
        backgroundColor: "#161718",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        maxWidth: 400,
        zIndex: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    cardButton: {
        backgroundColor: "#212223",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 16,
        height: 64,
        aspectRatio: 5 / 3,
        justifyContent: "flex-end",
    },
    cardButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
    cardButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    catButton: {
        backgroundColor: "#212223",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 16,
        height: 86,
        aspectRatio: 4 / 3,
        justifyContent: "flex-end",
    },
    catButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
    catButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        justifyContent: "flex-end",
        zIndex: 10,
        alignItems: "center",
    },
    bottomsheetContainer: {
        flex: 1,
        backgroundColor: "grey",
    },
    contentContainer: {
        flex: 1,
        padding: 0,
        alignItems: "center",
        paddingBottom: 64,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    nameText: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
    },
    legend: {
        fontSize: 12,
        marginTop: 8,
        color: "#aaa",
    },
    menu: {
        width: "100%",
        flexDirection: "column",
        marginTop: 16,
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
});
