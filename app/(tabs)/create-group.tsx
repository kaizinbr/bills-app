import api from "@/lib/api";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Input from "@/components/core/input";

import { Host, Switch, Text, ToggleButton } from "@expo/ui/jetpack-compose";

import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";
import { useCreateGroup } from "@/hooks/use-create-group";
import { useRouter } from "expo-router";

export default function CreateGroup() {
    const router = useRouter();
    const { mutate: createGroup, isPending, isError, error } = useCreateGroup();

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    let today = new Date();
    const defaultStyles = useDefaultStyles();
    const [selected, setSelected] = useState<DateType>();

    const [checked, setChecked] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [iPay, setIPay] = useState(false);
    const [iReceive, setIReceive] = useState(false);
    const [groupPayer, setGroupPayer] = useState("");
    const [groupReceiver, setGroupReceiver] = useState("");
    const [groupClosingDate, setGroupClosingDate] = useState<DateType>();
    const [groupArchived, setGroupArchived] = useState(false);
    const [groupCards, setGroupCards] = useState("");

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);

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

        if (!resolvedPayerId || !resolvedReceiverId) {
            console.warn(
                "Selecione o pagador e o recebedor antes de criar o grupo.",
            );
            return;
        }

        createGroup(
            {
                name: groupName,
                payerId: resolvedPayerId,
                receiverId: resolvedReceiverId,
                closingDay: groupClosingDate
                    ? new Date(groupClosingDate as string).getUTCDate()
                    : undefined,
                archived: groupArchived,
                cards: groupCards,
            },
            {
                onSuccess: () => {
                    router.back();
                },
            },
        );
    };

    return (
        <View style={styles.main}>
            <StatusBar />
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
                        paddingTop: insets.top + 32,
                    }}
                    style={[styles.container]}
                >
                    <TextDefault style={styles.title}>Criar grupo</TextDefault>
                    <TextDefault style={styles.description}>
                        Esta é a tela de criação de grupo.
                    </TextDefault>

                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Nome do grupo
                        </TextDefault>
                        <Input
                            placeholder="Nome do grupo"
                            // style={[styles.input]}
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Quem paga
                        </TextDefault>

                        {!iPay &&
                            users.length > 0 &&
                            users.map((user) => (
                                <Pressable
                                    key={user.id}
                                    onPress={() =>
                                        setGroupPayer(
                                            groupPayer === user.id
                                                ? ""
                                                : user.id,
                                        )
                                    }
                                    style={{
                                        padding: 8,
                                        backgroundColor: "#212223",
                                        borderRadius: 8,
                                        marginBottom: 8,
                                        borderWidth: 1,
                                        borderColor:
                                            groupPayer === user.id
                                                ? "#007AFF"
                                                : "#333333",
                                    }}
                                >
                                    <TextDefault>{user.name}</TextDefault>
                                </Pressable>
                            ))}
                        <Host matchContents>
                            <ToggleButton
                                checked={iPay}
                                onCheckedChange={setIPay}
                            >
                                <Text>Eu pago</Text>
                            </ToggleButton>
                        </Host>
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Quem recebe
                        </TextDefault>

                        {!iReceive &&
                            users.length > 0 &&
                            users.map((user) => (
                                <Pressable
                                    key={user.id}
                                    onPress={() =>
                                        setGroupReceiver(
                                            groupReceiver === user.id
                                                ? ""
                                                : user.id,
                                        )
                                    }
                                    style={{
                                        padding: 8,
                                        backgroundColor: "#212223",
                                        borderRadius: 8,
                                        marginBottom: 8,
                                        borderWidth: 1,
                                        borderColor:
                                            groupReceiver === user.id
                                                ? "#007AFF"
                                                : "#333333",
                                    }}
                                >
                                    <TextDefault>{user.name}</TextDefault>
                                </Pressable>
                            ))}
                        <Host matchContents>
                            <ToggleButton
                                checked={iReceive}
                                onCheckedChange={setIReceive}
                            >
                                <Text>Eu recebo</Text>
                            </ToggleButton>
                        </Host>
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Fechamento em{" "}
                            {new Date(groupClosingDate as string).getUTCDate()}{" "}
                            de cada mês
                        </TextDefault>
                        <DateTimePicker
                            mode="single"
                            date={groupClosingDate}
                            month={5}
                            onChange={({ date }) => setGroupClosingDate(date)}
                            timeZone="America/Fortaleza"
                            disabledDates={(date) => {
                                return (
                                    new Date(date as string).getUTCDate() > 28
                                ); // Desabilita apenas dias maiores que 28 para manter o ciclo mensal
                            }}
                            disableMonthPicker={true}
                            disableYearPicker={true}
                            hideHeader={true}
                            hideWeekdays={true}
                            styles={{
                                ...defaultStyles,
                                today: { borderColor: "gray", borderWidth: 1 }, // Add a border to today's date
                                selected: { backgroundColor: "gray" }, // Highlight the selected day
                                selected_label: { color: "white" }, // Highlight the selected day label
                            }}
                            // minDate={today} // Set the minimum selectable date to today
                            // enabledDates={(date) => dayjs(date).day() === 1} // Enable only Mondays (takes precedence over disabledDates)
                            // disabledDates={(date) =>
                            //     [0, 6].includes(dayjs(date).day())
                            // } // Disable weekends
                        />
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Arquivada
                        </TextDefault>

                        <Host matchContents>
                            <Switch
                                value={groupArchived}
                                onCheckedChange={setGroupArchived}
                            />
                        </Host>

                        <Host matchContents>
                            <ToggleButton
                                checked={groupArchived}
                                onCheckedChange={setGroupArchived}
                            >
                                <Text>Arquivada</Text>
                            </ToggleButton>
                        </Host>
                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>Cartões</TextDefault>
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <Pressable key={card.id}>
                                    <Text>{card.name}</Text>
                                </Pressable>
                            ))
                        ) : (
                            <TextDefault>Nenhum cartão encontrado</TextDefault>
                        )}
                    </View>
                    <Pressable
                        onPress={handleCreateGroup}
                        disabled={isPending}
                        style={{
                            padding: 12,
                            backgroundColor: "#282828",
                            borderRadius: 8,
                            marginTop: 16,
                            opacity: isPending ? 0.6 : 1,
                        }}
                    >
                        <TextDefault style={{ color: "#fff" }}>
                            {isPending ? "Criando..." : "Criar grupo"}
                        </TextDefault>
                    </Pressable>

                    {isError && (
                        <TextDefault style={{ color: "#FF6B6B", marginTop: 8 }}>
                            Não foi possível criar o grupo. Tente novamente.
                        </TextDefault>
                    )}
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
    container: {
        flex: 1,
        paddingHorizontal: 16,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
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
});
