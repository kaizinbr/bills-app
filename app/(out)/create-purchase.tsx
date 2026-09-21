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
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Input from "@/components/core/input";

import { Host, Switch } from "@expo/ui/jetpack-compose";

import BackBtn from "@/components/core/back-btn";
import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";

import { useGroups } from "@/hooks/use-group";

import { formatCurrency } from "@/lib/format-currency";

// Divide o valor total em `installments` parcelas iguais (em centavos),
// jogando o resto do arredondamento na 1ª parcela — mesma regra usada no
// backend, só que aqui é pra exibir o preview antes de enviar.
function getInstallmentPreview(
    totalCents: number,
    installments: number,
): string {
    if (installments < 2 || totalCents <= 0) return "";

    const base = Math.floor(totalCents / installments);
    const remainder = totalCents - base * installments;
    const firstAmount = base + remainder;

    if (remainder === 0) {
        return `${installments}x de ${formatCurrency(base)}`;
    }
    return `${installments}x de ${formatCurrency(base)} (1ª parcela: ${formatCurrency(firstAmount)})`;
}

export default function CreateCard() {
    const router = useRouter();
    const local = useLocalSearchParams();

    const { data, refetch, isFetching } = useGroups();
    const groupId = local.groupId as string; // ainda usado pra buscar cartões do grupo
    const invoiceId = local.invoiceId as string; // fatura de destino, vem pronta da home
    const purchaseId = local.purchaseId as string; // id da compra, se for edição

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    const [showDatePicker, setShowDatePicker] = useState(false);

    let today = new Date();
    const defaultStyles = useDefaultStyles();

    const [groupData, setGroupData] = useState<any>(null);

    const [cardName, setCardName] = useState("");
    const [amountCents, setAmountCents] = useState("");
    const [purchasedToday, setPurchasedToday] = useState<boolean>(true);
    const [purchaseDate, setPurchaseDate] = useState<DateType>(today);

    // parcelamento
    const [isInstallment, setIsInstallment] = useState<boolean>(false);
    const [installmentsCount, setInstallmentsCount] = useState("");

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
        null,
    );
    const [category, setCategory] = useState<string | null>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [canSubmit, setCanSubmit] = useState(false);

    const totalCents = parseInt(amountCents, 10) || 0;
    const installmentsNumber = parseInt(installmentsCount, 10) || 0;
    const installmentPreview = isInstallment
        ? getInstallmentPreview(totalCents, installmentsNumber)
        : "";

    useEffect(() => {
        const hasValidAmount = !Number.isNaN(parseInt(amountCents, 10));
        const hasValidInstallments = !isInstallment || installmentsNumber >= 2;

        if (
            cardName.trim() !== "" &&
            hasValidAmount &&
            category !== null &&
            hasValidInstallments
        ) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [
        cardName,
        amountCents,
        selectedCardId,
        category,
        isInstallment,
        installmentsCount,
    ]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data.users);

                const groupsResponse = await api.get(`groups/${groupId}`);
                setGroupData(groupsResponse.data.group);
                setCards(groupsResponse.data.group?.cards ?? []);
                setMembers(groupsResponse.data.group?.members ?? []);

                const categoriesResponse = await api.get(`categories`);
                setCategories(categoriesResponse.data.categories);
                setCategory(categoriesResponse.data.categories[0].id);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const [error, setError] = useState<string | null>(null);

    const handleCreatePurchase = async () => {
        try {
            const resolvedDate = purchasedToday
                ? new Date()
                : new Date(purchaseDate as string);

            if (isInstallment) {
                await api.post("/parcelado", {
                    description: cardName,
                    totalAmount: totalCents,
                    installments: installmentsNumber,
                    dayOfMonth: resolvedDate.getUTCDate(),
                    startDate: resolvedDate,
                    cardId: selectedCardId,
                    groupId: groupId,
                    userId: selectedMemberId,
                    categoryId: category,
                });
            } else {
                await api.post("/purchases", {
                    description: cardName,
                    amount: totalCents,
                    purchasedDate: resolvedDate,
                    cardId: selectedCardId,
                    invoiceId: invoiceId,
                    groupId: groupId,
                    userId: selectedMemberId,
                    categoryId: category,
                });
            }

            refetch();
            router.back();
        } catch (error) {
            setError(
                isInstallment
                    ? "Erro ao criar o parcelamento."
                    : "Erro ao criar a compra.",
            );
            console.error("Error creating purchase:", error);
        }
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            <BackBtn />
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
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={{
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 8,
                            paddingTop: insets.top + 64,
                            paddingBottom: insets.bottom + 64,
                        }}
                        showsVerticalScrollIndicator={false}
                        style={[styles.container]}
                    >
                        <TextDefault style={styles.title}>
                            Criar Compra
                        </TextDefault>
                        <View
                            style={{
                                paddingHorizontal: 24,
                            }}
                        >
                            <TextDefault
                                style={{
                                    paddingHorizontal: 24,
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
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Título da compra
                            </TextDefault>
                            <Input
                                placeholder="Lanche no dêssa"
                                value={cardName}
                                onChangeText={setCardName}
                            />
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                {isInstallment ? "Valor total" : "Valor"}
                            </TextDefault>
                            <Input
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

                        <View style={[styles.inputContainer]}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Host matchContents>
                                    <Switch
                                        value={isInstallment}
                                        onCheckedChange={(value) => {
                                            setIsInstallment(value);
                                            if (value) {
                                                // parcelamento exige uma data
                                                // explícita (dia 1-28), não dá
                                                // pra assumir "hoje" às cegas
                                                setPurchasedToday(false);
                                            }
                                        }}
                                        colors={{
                                            checkedThumbColor: "#0B3D22",
                                            checkedTrackColor: "#009C7A",
                                        }}
                                    />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>
                                    Compra parcelada
                                </TextDefault>
                            </View>
                        </View>

                        {isInstallment && (
                            <View style={[styles.inputContainer]}>
                                <TextDefault style={styles.label}>
                                    Número de parcelas
                                </TextDefault>
                                <Input
                                    placeholder="Ex: 3"
                                    value={installmentsCount}
                                    onChangeText={(text) => {
                                        const digits = text
                                            .replace(/\D/g, "")
                                            .slice(0, 2); // até 99x
                                        setInstallmentsCount(digits);
                                    }}
                                    keyboardType="number-pad"
                                    inputMode="numeric"
                                />
                                {installmentPreview !== "" && (
                                    <TextDefault
                                        style={styles.installmentPreview}
                                    >
                                        {installmentPreview}
                                    </TextDefault>
                                )}
                            </View>
                        )}

                        <View
                            style={[
                                styles.inputContainer,
                                { paddingHorizontal: 0 },
                            ]}
                        >
                            <TextDefault
                                style={[
                                    styles.label,
                                    { paddingHorizontal: 24 },
                                ]}
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
                                    paddingHorizontal: 24,
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
                                        <TextDefault
                                            style={styles.catButtonText}
                                        >
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
                                style={[
                                    styles.label,
                                    { paddingHorizontal: 24 },
                                ]}
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
                                    paddingHorizontal: 24,
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <Pressable
                                    onPress={() => setSelectedCardId(null)}
                                    style={[
                                        styles.cardButton,
                                        selectedCardId === null &&
                                            styles.cardButtonSelected,
                                    ]}
                                >
                                    <TextDefault style={styles.cardButtonText}>
                                        Sem cartão
                                    </TextDefault>
                                </Pressable>
                                {cards.map((card) => (
                                    <Pressable
                                        key={card.id}
                                        onPress={() =>
                                            setSelectedCardId(card.id)
                                        }
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
                                        <TextDefault
                                            style={styles.cardButtonText}
                                        >
                                            {card.name}
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
                                style={[
                                    styles.label,
                                    { paddingHorizontal: 24 },
                                ]}
                            >
                                {isInstallment
                                    ? "Dono do parcelamento"
                                    : "Usuário que fez a compra"}
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
                                    paddingHorizontal: 24,
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <Pressable
                                    onPress={() => setSelectedMemberId(null)}
                                    style={[
                                        styles.cardButton,
                                        selectedMemberId === null &&
                                            styles.cardButtonSelected,
                                    ]}
                                >
                                    <TextDefault style={styles.cardButtonText}>
                                        Sem usuário
                                    </TextDefault>
                                </Pressable>
                                {members.map((member) => (
                                    <Pressable
                                        key={member.id}
                                        onPress={() => {
                                            setSelectedMemberId(member.user.id);
                                            // console.log("selectedMemberId", member.user.id)
                                        }}
                                        style={[
                                            styles.cardButton,
                                            selectedMemberId === member.id &&
                                                styles.cardButtonSelected,
                                        ]}
                                    >
                                        <TextDefault
                                            style={styles.cardButtonText}
                                        >
                                            {member.user?.name || member.id}
                                        </TextDefault>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {!isInstallment && (
                            <View style={[styles.inputContainer]}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Host matchContents>
                                        <Switch
                                            value={purchasedToday}
                                            onCheckedChange={setPurchasedToday}
                                            colors={{
                                                checkedThumbColor: "#0B3D22",
                                                checkedTrackColor: "#009C7A",
                                            }}
                                        />
                                    </Host>
                                    <TextDefault style={{ marginLeft: 8 }}>
                                        Comprado hoje
                                    </TextDefault>
                                </View>
                            </View>
                        )}

                        {(isInstallment || !purchasedToday) && (
                            <View style={[styles.inputContainer]}>
                                <TextDefault style={styles.label}>
                                    {isInstallment
                                        ? "Data da 1ª parcela (dia 1 a 28)"
                                        : "Selecione a data da compra"}
                                </TextDefault>
                                <Pressable
                                    onPress={() => {
                                        setShowDatePicker(true);
                                    }}
                                    style={styles.input}
                                >
                                    <TextDefault>
                                        {new Date(
                                            purchaseDate as string,
                                        ).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </TextDefault>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
            <Pressable
                onPress={handleCreatePurchase}
                style={[
                    styles.submitBtn,
                    {
                        bottom: insets.bottom + 16,
                        opacity: canSubmit ? 1 : 0.5,
                    },
                ]}
                disabled={!canSubmit}
            >
                <TextDefault style={{ color: "#fff", fontWeight: "700" }}>
                    {isInstallment ? "Criar parcelamento" : "Criar compra"}
                </TextDefault>
            </Pressable>
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
                                width: "100%",
                                marginBottom: 8,
                            }}
                        >
                            {error}
                        </TextDefault>
                        <TextDefault
                            style={{
                                color: "#fff",
                                textAlign: "center",
                            }}
                        >
                            Verifique se todos os campos obrigatórios foram
                            preenchidos corretamente e tente novamente. Caso a
                            compra seja para outra data, verifique se está
                            dentro do período atual da fatura.
                        </TextDefault>
                        <Pressable
                            onPress={() => {
                                setError(null);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
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
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    setShowDatePicker(false);
                }}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => {
                        setShowDatePicker(false);
                    }}
                >
                    <View
                        style={styles.modalBox}
                        onStartShouldSetResponder={() => true}
                    >
                        <DateTimePicker
                            date={purchaseDate}
                            onChange={({ date }) => {
                                setPurchaseDate(date);
                            }}
                            mode="single"
                            style={{ width: "100%" }}
                            locale="pt-br"
                            timeZone="America/Fortaleza"
                            disabledDates={
                                isInstallment
                                    ? (date) =>
                                          new Date(
                                              date as string,
                                          ).getUTCDate() > 28
                                    : undefined
                            }
                            styles={{
                                ...defaultStyles,
                                today: {
                                    borderColor: "gray",
                                    borderWidth: 1,
                                },
                                selected: { backgroundColor: "gray" },
                                selected_label: { color: "white" },
                            }}
                        />
                        <Pressable
                            onPress={() => {
                                setShowDatePicker(false);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",

                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Pronto
                            </TextDefault>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
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
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        paddingHorizontal: 24,
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
        marginBottom: 8,
    },
    installmentPreview: {
        color: "#8f8f8f",
        fontSize: 12,
        marginTop: 6,
    },
    input: {
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#212223",
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
        height: 64,
        aspectRatio: 5 / 3,
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
        position: "absolute",
        bottom: 32,
        left: 16,
        right: 16,
        zIndex: 30,
        alignItems: "center",
    },
});
