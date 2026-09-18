// app/create-subscription.tsx
import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackBtn from "@/components/core/back-btn";

import { SubscriptionItem } from "@/components/subscriptions/subscription-item";
import { useDefaultStyles } from "react-native-ui-datepicker";

import { formatCurrency } from "@/lib/format-currency";
import { useIncomesFromInvoice } from "@/hooks/use-income-total";
import AddIncomeBottomSheet from "@/components/incomes/add-income-bottomsheet";

import { ArrowUpIcon } from "@solar-icons/react-native/linear/arrow-up";

export default function CreateSubscription() {
    const router = useRouter();
    const local = useLocalSearchParams();
    const invoiceId = local.invoiceId as string;
    console.log("CreateSubscription groupId", invoiceId);

    const { data, isLoading, isError, refetch } =
        useIncomesFromInvoice(invoiceId);

    const { session } = useAuth();
    const insets = useSafeAreaInsets();
    const defaultStyles = useDefaultStyles();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setLoading(false);
        }
    }, []);

    const snapPoints = useMemo(() => ["50%", "85%", "100%"], []);

    const bottomSheetAddIncomeRef = useRef<BottomSheetModal>(null);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetAddIncomeRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const { dismiss } = useBottomSheetModal();

    const onFinish = () => {
        dismiss();
        refetch();
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            <BackBtn />
            {loading || isLoading || isError || data === undefined ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"#fff"} size={"large"} />
                </View>
            ) : (
                <ScrollView
                    horizontal={false}
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 64,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 8,
                        paddingTop: insets.top + 64,
                    }}
                    showsVerticalScrollIndicator={false}
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refetch}
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
                    <TextDefault style={styles.title}>
                        Suas entradas do mês
                    </TextDefault>
                    <TextDefault
                        style={{ color: "#fff", paddingHorizontal: 16, fontSize: 12, marginBottom: 8 }}
                    >
                        Aqui você pode visualizar todas as suas entradas de
                        renda do mês.
                    </TextDefault>
                    {data.incomes.length === 0 ? (
                        <TextDefault
                            style={{ color: "#fff", paddingHorizontal: 16 }}
                        >
                            Nenhuma entrada de renda encontrada. Adicione uma
                            nova entrada.
                        </TextDefault>
                    ) : (
                        <View
                            style={{
                                width: "100%",
                                gap: 8,
                            }}
                        >
                            <TextDefault
                                style={{ color: "#fff", paddingHorizontal: 16 }}
                            >
                                Total de entradas: {formatCurrency(data.total)}
                            </TextDefault>
                            {data.incomes.map((income: any) => (
                                <View style={styles.incomeItem} key={income.id}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <View style={styles.incomeIcon}>
                                            <ArrowUpIcon
                                                strokeWidth={3}
                                                color="#fff"
                                            />
                                        </View>

                                        <TextDefault>
                                            {income.description}
                                        </TextDefault>
                                    </View>
                                    <TextDefault style={{ fontWeight: "700" }}>
                                        {formatCurrency(income.amount)}
                                    </TextDefault>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
            <Pressable
                onPress={handlePresentModalPress}
                style={[
                    styles.submitBtn,
                    {
                        bottom: 16,
                    },
                ]}
            >
                <TextDefault style={{ color: "#fff", fontWeight: "700" }}>
                    Adicionar nova entrada
                </TextDefault>
            </Pressable>

            <BottomSheetModal
                ref={bottomSheetAddIncomeRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // bottomSheetAddIncomeRef.current?.dismiss();
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
                enableDynamicSizing={true}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <AddIncomeBottomSheet
                        invoiceId={invoiceId}
                        onFinish={onFinish}
                    />
                </BottomSheetView>
            </BottomSheetModal>

            {error && (
                <View
                    style={[
                        styles.overlay,
                        StyleSheet.absoluteFill,
                        { zIndex: 10 },
                    ]}
                >
                    <View style={styles.modalBox}>
                        <TextDefault
                            style={{
                                color: "#fff",
                                textAlign: "center",
                                fontWeight: "700",
                                fontSize: 16,
                                marginBottom: 8,
                            }}
                        >
                            {error}
                        </TextDefault>
                        <TextDefault
                            style={{ color: "#fff", textAlign: "center" }}
                        >
                            Verifique se todos os campos obrigatórios foram
                            preenchidos e tente novamente.
                        </TextDefault>
                        <Pressable
                            onPress={() => setError(null)}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Fechar
                            </TextDefault>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: "#161718" },
    keyboardContainer: { flex: 1, zIndex: 1 },
    container: { flex: 1, zIndex: 1 },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        paddingHorizontal: 16,
    },
    label: { color: "#eeeeee", fontSize: 12, marginBottom: 8 },
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
    cardButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
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
    catButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        position: "absolute",
        // bottom: 32,
        left: 16,
        right: 16,
        zIndex: 50,
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

    incomeItem: {
        padding: 16,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
    incomeIcon: {
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: "#00C89B",
        alignItems: "center",
        justifyContent: "center",
    },
});
