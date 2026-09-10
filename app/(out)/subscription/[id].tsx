import api from "@/lib/api";
// import "dayjs/locale/pt-br";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import { PurchaseIcon } from "@/components/home/purchase-icon";
import { formatCurrency } from "@/lib/format-currency";
import {
    ActivityIndicator,
    Animated,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal
} from "@gorhom/bottom-sheet";


import BackBtn from "@/components/core/back-btn";
import EditSubscriptionBottomSheet from "@/components/subscriptions/edit-subscription-bottomsheet";
import {
    useDefaultStyles
} from "react-native-ui-datepicker";

function formatMoneyInput(digits: string) {
    if (!digits) return "";

    const paddedDigits = digits.padStart(3, "0");
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = paddedDigits.slice(-2);

    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

export default function PurchasePage() {
    const router = useRouter();
    const local = useLocalSearchParams();
    const subscriptionId = local.id as string; // id da compra, se for edição
    console.log("Local search params:", local.id);

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [data, setData] = useState<any>(null);

    let today = new Date();
    const defaultStyles = useDefaultStyles();
    const fecthData = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await api.get(`/subscriptions/${subscriptionId}`);
            setData(response.data.subscription);
            // console.log("Fetched purchase data:", response.data.purchase);
            setError(null);
            setLoading(false);
        } catch (error) {
            setError("Erro ao buscar os dados da compra.");
            setLoading(false);
            console.error("Error fetching users:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fecthData();
    }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeletePurchase = async () => {
        try {
            const response = await api.delete(`/subscriptions/${subscriptionId}`);
            console.log("Purchase deleted:", response.data.purchase);
            setShowDeleteModal(false);
            router.back();
        } catch (error) {
            console.error("Error deleting purchase:", error);
            setError("Erro ao excluir a compra.");
        }
    };

    // bottomsheets
    // ref
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["50%", "85%", "100%"], []);

    // callbacks
    // const handleSheetChanges = useCallback((index: number) => {
    //     console.log("handleSheetChanges", index);
    // }, []);

    const openSheet = useCallback(() => {
        bottomSheetRef.current?.present();
    }, []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const { dismiss } = useBottomSheetModal();

    return (
        <View style={styles.main}>
            <StatusBar />
            {loading && (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"#fff"} size={"large"} />
                </View>
            )}
            {data && (
                <Animated.ScrollView
                    horizontal={false}
                    contentContainerStyle={{
                        paddingBottom: 32,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 8,
                        paddingTop: insets.top + 64,
                        paddingHorizontal: 16,
                        height: "100%",
                    }}
                    showsVerticalScrollIndicator={false}
                    style={[styles.container]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setError(null);
                                fecthData(true);
                            }}
                            progressViewOffset={
                                Platform.OS === "android" ? 64 + insets.top : 0
                            }
                            progressBackgroundColor="#282828"
                            colors={["#5E8C61", "#5E8C61"]}
                            style={{
                                borderWidth: 0.5,
                                borderColor: "#56595D",
                            }}
                        />
                    }
                >
                    <BackBtn />
                    <TextDefault style={styles.title}>
                        {data.description ||
                            data.category?.label ||
                            "Sem descrição"}{" "}
                        · {formatCurrency(data.amount)}
                    </TextDefault>

                    <TextDefault
                        style={[
                            styles.label,
                            {
                                marginBottom: 16,
                            },
                        ]}
                    >
                        Assinatura
                    </TextDefault>

                    <View
                        style={[
                            styles.section,
                            {
                                flexDirection: "row",
                                gap: 8,
                                alignItems: "center",
                            },
                        ]}
                    >
                        <PurchaseIcon
                            categoryKey={data.category?.key}
                            style={styles.icon}
                        />
                        <View>
                            <TextDefault style={styles.label}>
                                Categoria
                            </TextDefault>
                            <TextDefault style={styles.description}>
                                {data.category?.label ||
                                    "Sem categoria"}
                            </TextDefault>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <TextDefault style={styles.label}>
                            Cadastrada em
                        </TextDefault>
                        <TextDefault style={styles.description}>
                            {new Date(
                                data.createdAt,
                            ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </TextDefault>
                    </View>
                    {data.amount && (
                        <View style={styles.section}>
                            <TextDefault style={styles.label}>
                                Valor
                            </TextDefault>
                            <TextDefault style={styles.description}>
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(data.amount)}
                            </TextDefault>
                        </View>
                    )}

                    {data.cardId && (
                        <View style={styles.section}>
                            <TextDefault style={styles.label}>
                                Cartão
                            </TextDefault>
                            <TextDefault style={styles.description}>
                                {data.card.name} ·{" "}
                                {data.card.digits}
                            </TextDefault>
                        </View>
                    )}
                    <View
                        style={{
                            position: "absolute",
                            bottom: insets.bottom + 16,
                            left: 16,
                            right: 16,
                            gap: 8,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                setShowDeleteModal(true);
                            }}
                            style={[
                                styles.submitBtn,
                                {
                                    borderWidth: 2,
                                    borderColor: "#009C7A",
                                    backgroundColor: "#161718",
                                },
                            ]}
                            // disabled={!canSubmit}
                        >
                            <TextDefault
                                style={{ color: "#fff", fontWeight: "700" }}
                            >
                                Excluir assinatura
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            onPress={handlePresentModalPress}
                            style={[
                                styles.submitBtn,
                                {
                                    // bottom: insets.bottom + 16,
                                    // opacity: canSubmit ? 1 : 0.5,
                                },
                            ]}
                            // disabled={!canSubmit}
                        >
                            <TextDefault
                                style={{ color: "#fff", fontWeight: "700" }}
                            >
                                Editar assinatura
                            </TextDefault>
                        </Pressable>
                    </View>
                </Animated.ScrollView>
            )}

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
                    fecthData(true);
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
            >
                <BottomSheetView style={styles.contentContainer}>
                    <EditSubscriptionBottomSheet
                        initialData={data}
                        onFinish={() => {
                            bottomSheetModalRef.current?.dismiss();
                        }}
                    />
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    container: {
        flex: 1,
        zIndex: 1,
        minHeight: "100%",
    },
    backButton: {
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    description: {
        fontSize: 16,
        textAlign: "center",
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
    },
});
