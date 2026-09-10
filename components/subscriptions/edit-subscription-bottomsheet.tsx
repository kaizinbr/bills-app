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

function formatMoneyInput(digits: string) {
    const cleanDigits = digits.replace(/\D/g, "");
    if (!cleanDigits) return "";

    const paddedDigits = cleanDigits.padStart(3, "0");
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = paddedDigits.slice(-2);

    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

function parseAmountToCents(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") return "";

    const rawValue = String(value).trim().replace(",", ".");
    if (!/^\d+(?:\.\d{1,2})?$/.test(rawValue)) return "";

    const [integerPart, decimalPart = ""] = rawValue.split(".");
    return `${integerPart}${decimalPart.padEnd(2, "0")}`;
}

export default function EditSubscriptionBottomSheet({
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
        name: initialData.name || "",
        amount: initialData.amount || "",
        categoryId: initialData.categoryId || null,
        cardId: initialData.cardId || null,
    });

    const [cardName, setCardName] = useState(data.name || "");
    const [amountCents, setAmountCents] = useState(
        parseAmountToCents(data.amount),
    );
    const [purchasedToday, setPurchasedToday] = useState<boolean>(true);
    const [purchaseDate, setPurchaseDate] = useState<DateType>(today);

    const [myPurchase, setMyPurchase] = useState<boolean>(true);
    const [purchaseOwner, setPurchaseOwner] = useState<string | null>(
        currentUserId!,
    );

    const [selectedCardId, setSelectedCardId] = useState<string | null>(data.cardId);
    const [category, setCategory] = useState<string | null>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        if (
            cardName.trim() !== "" &&
            amountCents.trim() !== "" &&
            category !== null
        ) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [cardName, amountCents, selectedCardId, category]);

    useEffect(() => {
        const fetchCatgories = async () => {
            try {
                const response = await api.get(
                    `groups/${initialData.groupId}`,
                );
                setData((prevData) => ({
                    ...prevData,
                    groupId: response.data.group.id,
                }));
                setCards(response.data.group?.cards ?? []);

                const categoriesResponse = await api.get(`categories`);
                setCategories(categoriesResponse.data.categories);
                setCategory(initialData.categoryId);

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

            const response = await api.patch(`/subscriptions/${initialData.id}`, {
                name: cardName,
                amount: amountCents,
                cardId: selectedCardId,
                categoryId: category,
            });
            console.log("Subscription updated successfully:", response.data);
            onFinish();
        } catch (error) {
            setError("Erro ao atualizar a assinatura.");
            console.error("Error updating subscription:", error);
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
                        <TextDefault style={styles.label}>Valor</TextDefault>
                        <BottomSheetInput
                            placeholder="R$ 0,00"
                            value={formatMoneyInput(amountCents)}
                            selection={{
                                start: formatMoneyInput(amountCents).length,
                                end: formatMoneyInput(amountCents).length,
                            }}
                            onChangeText={(text) => {
                                const digits = text
                                    .replace(/\D/g, "")
                                    .slice(0, 10);
                                setAmountCents(digits);
                            }}
                            keyboardType="number-pad"
                            inputMode="numeric"
                        />
                    </View>
                    <View
                        style={[
                            styles.inputContainer,
                            { paddingHorizontal: 0 },
                        ]}
                    >
                        <TextDefault
                            style={[styles.label, { paddingHorizontal: 16 }]}
                        >
                            Categoria
                        </TextDefault>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                gap: 8,
                            }}
                            contentContainerStyle={{
                                flexDirection: "row",
                                gap: 8,
                                paddingHorizontal: 16,
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            {categories.map((cat) => (
                                <Pressable
                                    key={cat.key}
                                    onPress={() => {
                                        setCategory(cat.id);
                                    }}
                                    style={[
                                        styles.catButton,
                                        category === cat.id &&
                                            styles.catButtonSelected,
                                    ]}
                                >
                                    <TextDefault style={styles.catButtonText}>
                                        {cat.label}
                                    </TextDefault>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    <View
                        style={[
                            styles.inputContainer,
                            { paddingHorizontal: 0 },
                        ]}
                    >
                        <TextDefault
                            style={[styles.label, { paddingHorizontal: 16 }]}
                        >
                            Cartão
                        </TextDefault>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                gap: 8,
                            }}
                            contentContainerStyle={{
                                flexDirection: "row",
                                gap: 8,
                                paddingHorizontal: 16,
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            {cards.map((card) => (
                                <Pressable
                                    key={card.id}
                                    onPress={() => setSelectedCardId(card.id)}
                                    style={[
                                        styles.cardButton,
                                        selectedCardId === card.id &&
                                            styles.cardButtonSelected,

                                        {
                                            backgroundColor:
                                                card.color || "#282828",
                                        },
                                    ]}
                                >
                                    <TextDefault style={styles.cardButtonText}>
                                        {card.name}
                                    </TextDefault>
                                </Pressable>
                            ))}
                        </ScrollView>
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
