// app/create-subscription.tsx
import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Input from "@/components/core/input";
import BackBtn from "@/components/core/back-btn";

import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";

function formatMoneyInput(digits: string) {
    const cleanDigits = digits.replace(/\D/g, "");
    if (!cleanDigits) return "";

    const paddedDigits = cleanDigits.padStart(3, "0");
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = paddedDigits.slice(-2);

    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

export default function CreateSubscription() {
    const router = useRouter();
    const local = useLocalSearchParams();
    const groupId = local.groupId as string;

    const { session } = useAuth();
    const insets = useSafeAreaInsets();
    const defaultStyles = useDefaultStyles();

    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState<any>(null);

    const [name, setName] = useState("");
    const [amountCents, setAmountCents] = useState("");
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    // dia 1 do mês atual, pra nunca abrir num dia já desabilitado (>28)
    const [chargeDate, setChargeDate] = useState<DateType>(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const chargeDay = new Date(chargeDate as string).getUTCDate();

    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [canSubmit, setCanSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCanSubmit(
            name.trim() !== "" &&
                amountCents.trim() !== "" &&
                category !== null &&
                selectedCardId !== null,
        );
    }, [name, amountCents, category, selectedCardId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupsResponse = await api.get(`groups/${groupId}`);
                setGroupData(groupsResponse.data.group);
                setCards(groupsResponse.data.group?.cards ?? []);

                const categoriesResponse = await api.get(`categories`);
                setCategories(categoriesResponse.data.categories);
                setCategory(categoriesResponse.data.categories[0].id);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleCreateSubscription = async () => {
        try {
            await api.post("/subscriptions", {
                name,
                amountCents,
                cardId: selectedCardId,
                categoryId: category,
                chargeDay,
            });
            router.back();
        } catch (err) {
            setError("Erro ao criar a assinatura.");
            console.error("Error creating subscription:", err);
        }
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator color={"#fff"} size={"large"} />
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={{
                            paddingBottom: 32,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 8,
                            paddingTop: insets.top + 64,
                        }}
                        showsVerticalScrollIndicator={false}
                        style={styles.container}
                    >
                        <BackBtn />
                        <TextDefault style={styles.title}>Criar Assinatura</TextDefault>

                        <View style={{ paddingHorizontal: 16 }}>
                            <TextDefault
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 6,
                                    fontWeight: "600",
                                    color: "#eeeeee",
                                    backgroundColor: "#009C7A",
                                    borderRadius: 999,
                                }}
                            >
                                {groupData?.name}
                            </TextDefault>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Nome da assinatura</TextDefault>
                            <Input
                                placeholder="Netflix, Spotify..."
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Valor mensal</TextDefault>
                            <Input
                                placeholder="R$ 0,00"
                                value={formatMoneyInput(amountCents)}
                                selection={{
                                    start: formatMoneyInput(amountCents).length,
                                    end: formatMoneyInput(amountCents).length,
                                }}
                                onChangeText={(text) => {
                                    setAmountCents(text.replace(/\D/g, "").slice(0, 10));
                                }}
                                keyboardType="number-pad"
                                inputMode="numeric"
                            />
                        </View>

                        <View style={[styles.inputContainer, { paddingHorizontal: 0 }]}>
                            <TextDefault style={[styles.label, { paddingHorizontal: 16 }]}>
                                Categoria
                            </TextDefault>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    flexDirection: "row",
                                    gap: 8,
                                    paddingHorizontal: 16,
                                }}
                            >
                                {categories.map((cat) => (
                                    <Pressable
                                        key={cat.key}
                                        onPress={() => setCategory(cat.id)}
                                        style={[
                                            styles.catButton,
                                            category === cat.id && styles.catButtonSelected,
                                        ]}
                                    >
                                        <TextDefault style={styles.catButtonText}>{cat.label}</TextDefault>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={[styles.inputContainer, { paddingHorizontal: 0 }]}>
                            <TextDefault style={[styles.label, { paddingHorizontal: 16 }]}>
                                Cartão
                            </TextDefault>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    flexDirection: "row",
                                    gap: 8,
                                    paddingHorizontal: 16,
                                }}
                            >
                                {cards.map((card) => (
                                    <Pressable
                                        key={card.id}
                                        onPress={() => setSelectedCardId(card.id)}
                                        style={[
                                            styles.cardButton,
                                            selectedCardId === card.id && styles.cardButtonSelected,
                                            { backgroundColor: card.color || "#282828" },
                                        ]}
                                    >
                                        <TextDefault style={styles.cardButtonText}>{card.name}</TextDefault>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            {cards.length === 0 && (
                                <TextDefault style={{ paddingHorizontal: 16, color: "#888" }}>
                                    Essa conta ainda não tem cartões. Crie um cartão primeiro.
                                </TextDefault>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>
                                Cobra dia {chargeDay} de cada mês
                            </TextDefault>
                            <DateTimePicker
                                mode="single"
                                date={chargeDate}
                                month={new Date().getMonth()}
                                onChange={({ date }) => setChargeDate(date)}
                                timeZone="America/Fortaleza"
                                disabledDates={(date) => new Date(date as string).getUTCDate() > 28}
                                disableMonthPicker
                                disableYearPicker
                                hideHeader
                                hideWeekdays
                                styles={{
                                    ...defaultStyles,
                                    today: { borderColor: "gray", borderWidth: 1 },
                                    selected: { backgroundColor: "#009C7A" },
                                    selected_label: { color: "white" },
                                }}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            <Pressable
                onPress={handleCreateSubscription}
                style={[
                    styles.submitBtn,
                    { bottom: insets.bottom + 16, opacity: canSubmit ? 1 : 0.5 },
                ]}
                disabled={!canSubmit}
            >
                <TextDefault style={{ color: "#fff", fontWeight: "700" }}>Criar assinatura</TextDefault>
            </Pressable>

            {error && (
                <View style={[styles.overlay, StyleSheet.absoluteFill, { zIndex: 10 }]}>
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
                        <TextDefault style={{ color: "#fff", textAlign: "center" }}>
                            Verifique se todos os campos obrigatórios foram preenchidos e tente novamente.
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
                            <TextDefault style={{ color: "#fff" }}>Fechar</TextDefault>
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
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, paddingHorizontal: 16 },
    inputContainer: { marginTop: 16, width: "100%", minWidth: "100%", paddingHorizontal: 16 },
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
    cardButtonSelected: { borderWidth: 2, borderColor: "#009C7A", backgroundColor: "#0B3D22" },
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
    catButtonSelected: { borderWidth: 2, borderColor: "#009C7A", backgroundColor: "#0B3D22" },
    catButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        position: "absolute",
        bottom: 32,
        left: 16,
        right: 16,
        zIndex: 10,
        alignItems: "center",
    },
});