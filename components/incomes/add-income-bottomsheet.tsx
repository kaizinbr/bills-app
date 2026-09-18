import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import TextDefault from "@/components/core/text-core";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetInput } from "@/components/core/input";

import { DateType, useDefaultStyles } from "react-native-ui-datepicker";

import { formatCurrency } from "@/lib/format-currency";

export default function AddIncomeBottomSheet({
    invoiceId,
    onFinish,
}: {
    invoiceId: string;
    onFinish: () => void;
}) {
    const router = useRouter();
    // console.log("initialData", initialData);

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);

    let today = new Date();
    const defaultStyles = useDefaultStyles();

    const [amountCents, setAmountCents] = useState("0");
    const [description, setDescription] = useState("");

    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        if (
            description.trim() !== "" &&
            amountCents.trim() !== "" &&
            parseInt(amountCents) > 0
        ) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [description, amountCents]);

    const [error, setError] = useState<string | null>(null);

    const handleUpdatePurchase = async () => {
        try {
            const response = await api.post(`/invoices/${invoiceId}/incomes`, {
                description,
                amount: parseInt(amountCents) || 0,
            });
            console.log("Purchase updated successfully:", response.data);
            onFinish();
        } catch (error) {
            setError("Erro ao atualizar a compra.");
            console.error("Error updating purchase:", error);
        }
    };

    return (
        <View style={[styles.main, { paddingBottom: insets.bottom }]}>
            {loading ? (
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
                        paddingBottom: 32,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 8,
                        paddingHorizontal: 16,
                    }}
                    showsVerticalScrollIndicator={false}
                    style={[styles.container]}
                >
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Descrição da entrada de renda
                        </TextDefault>
                        <BottomSheetInput
                            placeholder="Salário, Freelance, etc."
                            value={description}
                            onChangeText={setDescription}
                            maxLength={20}
                        />
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>Valor</TextDefault>
                        <BottomSheetInput
                            placeholder="R$ 0,00"
                            value={formatCurrency(amountCents)}
                            selection={{
                                start: formatCurrency(amountCents).length,
                                end: formatCurrency(amountCents).length,
                            }}
                            onChangeText={(text) => {
                                const digits = text
                                    .replace(/\D/g, "")
                                    .slice(0, 9);
                                setAmountCents(digits);
                            }}
                            keyboardType="number-pad"
                            inputMode="numeric"
                        />
                    </View>

                    <Pressable
                        onPress={handleUpdatePurchase}
                        style={[
                            styles.submitBtn,
                            {
                                opacity: canSubmit ? 1 : 0.5,
                            },
                        ]}
                        disabled={!canSubmit}
                    >
                        <TextDefault
                            style={{ color: "#fff", fontWeight: "700" }}
                        >
                            Adicionar entrada de renda
                        </TextDefault>
                    </Pressable>
                </ScrollView>
            )}
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
    },
    backButton: {
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
        marginBottom: 8,
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
        width: "100%",
        marginTop: 16,
    },
});
