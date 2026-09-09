import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import TextDefault from "@/components/core/text-core";
import {
    Animated,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetInput } from "@/components/core/input";

import { DateType, useDefaultStyles } from "react-native-ui-datepicker";

const CARDCOLORS = [
    { id: 6, hex: "#820AD1" }, // Nubank
    { id: 1, hex: "#CC092F" }, // Bradesco
    { id: 2, hex: "#003DA5" }, // Itaú
    { id: 3, hex: "#FFCC00" }, // Banco do Brasil
    { id: 4, hex: "#005CA9" }, // Caixa
    { id: 5, hex: "#E30613" }, // Santander
    { id: 7, hex: "#FF7A00" }, // Inter
    { id: 8, hex: "#00A868" }, // C6 Bank
    { id: 9, hex: "#00C389" }, // Neon
    { id: 10, hex: "#00BFA5" }, // PagBank
    { id: 11, hex: "#6A1B9A" }, // PicPay
    { id: 12, hex: "#EC7000" }, // Original
    { id: 13, hex: "#0066B3" }, // Safra
    { id: 14, hex: "#00843D" }, // Sicoob
    { id: 15, hex: "#009639" }, // Sicredi
    { id: 16, hex: "#0072CE" }, // BV
    { id: 17, hex: "#F58220" }, // PAN
    { id: 18, hex: "#D71920" }, // Banrisul
    { id: 19, hex: "#003B70" }, // BRB
    { id: 20, hex: "#0057B8" }, // BMG
    { id: 21, hex: "#E4002B" }, // Will Bank
    { id: 22, hex: "#FF6000" }, // iti
];

export default function EditCardBottomSheet({
    initialData,
    onFinish,
}: {
    initialData: any;
    onFinish: () => void;
}) {
    const router = useRouter();
    // console.log("initialData", initialData);

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    const [showDatePicker, setShowDatePicker] = useState(false);

    let today = new Date();
    const defaultStyles = useDefaultStyles();

    const [data, setData] = useState({
        name: initialData.name,
        digits: initialData.digits,
        color: initialData.color,
    });

    const [cardName, setCardName] = useState(data.name || "");
    const [digits, setDigits] = useState(data.digits || "");
    const [cardColor, setColor] = useState(data.color || "");

    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        if (
            cardName.trim() !== "" &&
            digits.trim() !== "" &&
            cardColor.trim() !== ""
        ) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [cardName, digits, cardColor]);

    useEffect(() => {
        const fetchCatgories = async () => {
            try {

                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCatgories();
    }, []);

    const [error, setError] = useState<string | null>(null);

    const handleUpdatePurchase = async () => {
        try {

            const response = await api.patch(`/cards/${initialData.id}`, {
                name: cardName,
                digits: digits,
                color: cardColor,
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
                    }}
                    showsVerticalScrollIndicator={false}
                    style={[styles.container]}
                >
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Título da compra
                        </TextDefault>
                        <BottomSheetInput
                            placeholder="Lanche no dêssa"
                            // style={[styles.input]}
                            value={cardName}
                            onChangeText={setCardName}
                        />
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Número do cartão
                        </TextDefault>
                        <BottomSheetInput
                            placeholder="1234"
                            value={digits}
                            onChangeText={setDigits}
                            maxLength={4}
                            keyboardType="number-pad"
                        />
                    </View>

                    
                                            <View
                                                style={[
                                                    styles.inputContainer,
                                                    { paddingHorizontal: 0 },
                                                ]}
                                            >
                                                <TextDefault
                                                    style={[
                                                        styles.label,
                                                        { paddingHorizontal: 16 },
                                                    ]}
                                                >
                                                    Cor do Cartão
                                                </TextDefault>
                                                <ScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    contentContainerStyle={{
                                                        flexDirection: "row",
                                                        gap: 8,
                                                        paddingVertical: 8,
                                                        paddingHorizontal: 16,
                                                    }}
                                                >
                                                    {CARDCOLORS.map((color) => (
                                                        <Pressable
                                                            key={color.id}
                                                            onPress={() => setColor(color.hex)}
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 999,
                                                                backgroundColor: color.hex,
                                                                borderWidth:
                                                                    cardColor === color.hex ? 3 : 0,
                                                                borderColor:
                                                                    cardColor === color.hex
                                                                        ? "#fff"
                                                                        : "transparent",
                                                            }}
                                                        />
                                                    ))}
                                                </ScrollView>
                                            </View>

                    <View
                        style={[
                            styles.inputContainer,
                            { paddingHorizontal: 0 },
                        ]}
                    >
                        <View style={{ padding: 16, paddingBottom: 0, width: "100%" }}>
                            <Pressable
                                onPress={handleUpdatePurchase}
                                style={[
                                    styles.submitBtn,
                                    {
                                        // bottom: insets.bottom + 16,
                                        opacity: canSubmit ? 1 : 0.5,
                                    },
                                ]}
                                disabled={!canSubmit}
                            >
                                <TextDefault
                                    style={{ color: "#fff", fontWeight: "700" }}
                                >
                                    Salvar alterações
                                </TextDefault>
                            </Pressable>
                        </View>
                    </View>
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
        // backgroundColor: "#fff",
        paddingHorizontal: 16,
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
    },
});
