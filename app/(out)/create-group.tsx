import api from "@/lib/api";
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

import { formatCurrency } from "@/lib/format-currency";

import BackBtn from "@/components/core/back-btn";
import { useCreateGroup } from "@/hooks/use-create-group";
import { useGroups } from "@/hooks/use-group";
import { useRouter } from "expo-router";
import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";

export default function CreateGroup() {
    const router = useRouter();
    const { mutate: createGroup, isPending, isError, error } = useCreateGroup();

    const { data, refetch, isFetching } = useGroups();

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    let today = new Date();
    const defaultStyles = useDefaultStyles();
    const [selected, setSelected] = useState<DateType>();

    const [checked, setChecked] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [amountCents, setAmountCents] = useState("");
    const [iPay, setIPay] = useState(true);
    const [iReceive, setIReceive] = useState(false);
    const [groupPayer, setGroupPayer] = useState("");
    const [groupReceiver, setGroupReceiver] = useState("");
    const [groupClosingDate, setGroupClosingDate] = useState<DateType>(
        new Date(),
    );
    const [groupArchived, setGroupArchived] = useState(false);
    const [groupCards, setGroupCards] = useState("");

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);

    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        // const resolvedPayerId = iPay ? currentUserId : groupPayer;
        // const resolvedReceiverId = iReceive ? currentUserId : groupReceiver;
        // setCanSubmit(!!resolvedPayerId && !!resolvedReceiverId);

        const nameValid = groupName.trim().length > 0;
        const closingDateValid = groupClosingDate instanceof Date;
        setCanSubmit(nameValid && closingDateValid);
    }, [groupName, groupClosingDate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data.users);
                console.log("Fetched users:", response.data.users);

                const cardsResponse = await api.get("/cards");
                setCards(cardsResponse.data.myCards);
                console.log("Fetched cards:", cardsResponse.data.myCards);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleCreateGroup = () => {
        const resolvedPayerId = iPay ? currentUserId : groupPayer;
        const resolvedReceiverId = iReceive ? currentUserId : groupReceiver;

        // if (!resolvedPayerId || !resolvedReceiverId) {
        //     console.warn(
        //         "Selecione o pagador e o recebedor antes de criar o grupo.",
        //     );
        //     return;
        // }

        createGroup(
            {
                name: groupName,
                amount: parseInt(amountCents) || 0,
                closingDay: groupClosingDate
                    ? new Date(groupClosingDate as string).getUTCDate()
                    : undefined,
                archived: groupArchived,
                cards: groupCards,
            },
            {
                onSuccess: () => {
                    refetch();
                    router.back();
                },
            },
        );
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
                            paddingBottom: 64,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 8,
                            paddingTop: insets.top + 64,
                        }}
                        style={[styles.container]}
                    >
                        <TextDefault style={styles.title}>
                            Criar conta
                        </TextDefault>
                        <TextDefault style={styles.description}>
                            Uma conta corresponde a um conjunto de despesas
                            mensais compartilhadas entre um grupo de pessoas.
                            Você pode criar uma conta para dividir despesas com
                            amigos, familiares ou colegas de trabalho.
                        </TextDefault>

                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Nome da conta
                            </TextDefault>
                            <Input
                                placeholder="Nome da conta"
                                // style={[styles.input]}
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                        </View>

                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Limite de gastos (opcional)
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

                        {/* <View style={[styles.inputContainer]}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Host matchContents>
                                    <Switch
                                        value={iPay}
                                        onCheckedChange={setIPay}
                                        colors={{
                                            checkedThumbColor: "#0B3D22",
                                            checkedTrackColor: "#009C7A",
                                        }}
                                    />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>
                                    Eu pago
                                </TextDefault>
                            </View>
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
                                        value={iReceive}
                                        onCheckedChange={setIReceive}
                                        colors={{
                                            checkedThumbColor: "#0B3D22",
                                            checkedTrackColor: "#009C7A",
                                        }}
                                    />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>
                                    Eu recebo
                                </TextDefault>
                            </View>
                        </View> */}
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Fechamento em{" "}
                                {new Date(
                                    groupClosingDate as string,
                                ).getUTCDate()}{" "}
                                de cada mês
                            </TextDefault>
                            <DateTimePicker
                                mode="single"
                                date={groupClosingDate}
                                month={5}
                                onChange={({ date }) =>
                                    setGroupClosingDate(date)
                                }
                                timeZone="America/Fortaleza"
                                disabledDates={(date) => {
                                    return (
                                        new Date(date as string).getUTCDate() >
                                        28
                                    ); // Desabilita apenas dias maiores que 28 para manter o ciclo mensal
                                }}
                                disableMonthPicker={true}
                                disableYearPicker={true}
                                hideHeader={true}
                                hideWeekdays={true}
                                styles={{
                                    ...defaultStyles,
                                    today: {
                                        borderColor: "gray",
                                        borderWidth: 1,
                                    }, // Add a border to today's date
                                    selected: { backgroundColor: "#009C7A" }, // Highlight the selected day
                                    selected_label: { color: "white" }, // Highlight the selected day label
                                }}
                            />
                        </View>

                        {isError && (
                            <TextDefault
                                style={{ color: "#FF6B6B", marginTop: 8 }}
                            >
                                Não foi possível criar o grupo. Tente novamente.
                            </TextDefault>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            <Pressable
                onPress={handleCreateGroup}
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
                    Criar conta
                </TextDefault>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    description: {
        fontSize: 12,
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        // backgroundColor: "#fff",
    },
    label: { color: "#eeeeee", fontSize: 12, marginBottom: 8 },
    input: {
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#262626",
        backgroundColor: "#212223",
        borderRadius: 12,
        color: "#eeeeee",
        fontFamily: "Walsheim",
        fontWeight: 400,
    },

    keyboardContainer: {
        flex: 1,
        zIndex: 1,
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
        zIndex: 10,
        alignItems: "center",
    },
});
