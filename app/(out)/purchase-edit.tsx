import api from "@/lib/api";
import "dayjs/locale/pt-br";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import { AltArrowLeftIcon } from "@solar-icons/react-native/linear/alt-arrow-left";
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
import PopoverCards from "@/components/purchases/popover-cards";
import PopoverUsers from "@/components/purchases/popover-users";
import PopoverCategories from "@/components/purchases/popover-categories";

import { Host, Switch } from "@expo/ui/jetpack-compose";

import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";
import DropdownMenu  from "@/components/core/dropdown-menu";

function formatMoneyInput(digits: string) {
    if (!digits) return "";

    const paddedDigits = digits.padStart(3, "0");
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = paddedDigits.slice(-2);

    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

export default function CreateCard() {
    const router = useRouter();
    const local = useLocalSearchParams();
    console.log("Local search params:", local.groupId, local.purchaseId);
    const groupId = local.groupId as string;

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

    const [myPurchase, setMyPurchase] = useState<boolean>(true);
    const [purchaseOwner, setPurchaseOwner] = useState<string | null>(currentUserId!);

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data.users);

                const groupsResponse = await api.get(`groups/${groupId}`);
                setGroupData(groupsResponse.data.group);
                setCards(groupsResponse.data.group?.cards ?? []);

                const categoriesResponse = await api.get(`categories`);
                setCategories(categoriesResponse.data.categories);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // const handleCreatePurchase = async () => {
    //     try {
    //         const resolvedOwner = myCard ? currentUserId : cardOwner;

    //         if (!resolvedOwner) {
    //             console.warn(
    //                 "Selecione o proprietário do cartão antes de criar o cartão.",
    //             );
    //             return;
    //         }

    //         const response = await api.post("/cards", {
    //             name: cardName,
    //             color: cardColor,
    //             ownerId: resolvedOwner,
    //             groupId: groupId,
    //             // closingDay: groupClosingDate
    //             //     ? new Date(groupClosingDate as string).getUTCDate()
    //             //     : undefined,
    //         });
    //         console.log("Group created:", response.data);
    //     } catch (error) {
    //         console.error("Error creating group:", error);
    //     }
    // };

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
                            paddingTop: insets.top + 32,
                        }}
                        style={[styles.container]}
                    >
                        <Pressable onPress={() => router.back()}>
                            <AltArrowLeftIcon size={24} color="#fff" />
                        </Pressable>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Grupo
                            </TextDefault>
                            <TextDefault>{groupData?.name}</TextDefault>
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Título da compra
                            </TextDefault>
                            <Input
                                placeholder="Lanche no dêssa"
                                // style={[styles.input]}
                                value={cardName}
                                onChangeText={setCardName}
                            />
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Valor
                            </TextDefault>
                            <Input
                                placeholder="R$ 0,00"
                                value={formatMoneyInput(amountCents)}
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

                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Cartão
                            </TextDefault>
                            <PopoverCards
                                items={cards}
                                selectedId={selectedCardId}
                                onSelect={setSelectedCardId}
                                placeholder="Sem cartão"
                            />
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Categoria
                            </TextDefault>
                            <PopoverCategories
                                items={categories}
                                selectedId={category}
                                onSelect={setCategory}
                                placeholder="Sem categoria"
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
                                        value={purchasedToday}
                                        onCheckedChange={setPurchasedToday}
                                    />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>
                                    Comprado hoje
                                </TextDefault>
                            </View>
                        </View>

                        {!purchasedToday && (
                            <View style={[styles.inputContainer]}>
                                <TextDefault style={styles.label}>
                                    Selecione a data da compra
                                </TextDefault>
                                <Pressable
                                    onPress={() => {
                                        console.log("Pressable tocado!");
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

                        <View style={[styles.inputContainer]}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Host matchContents>
                                    <Switch
                                        value={myPurchase}
                                        onCheckedChange={setMyPurchase}
                                    />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>
                                    Eu fiz essa compra
                                </TextDefault>
                            </View>
                        </View>

                        {!myPurchase && (
                            <View style={[styles.inputContainer]}>
                                <TextDefault style={styles.label}>
                                    Quem fez essa compra
                                </TextDefault>
                                <PopoverUsers 
                                    items={users}
                                    selectedId={purchaseOwner}
                                    onSelect={setPurchaseOwner}
                                    placeholder="Selecione o usuário"
                                />
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
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
                                // setShowDatePicker(false); <- causa erro pra abrir
                            }}
                            mode="single"
                            style={{ width: "100%" }}
                            // textStyle={defaultStyles.text}
                            // containerStyle={defaultStyles.container}
                            locale="pt-br"
                            timeZone="America/Fortaleza"
                            styles={{
                                ...defaultStyles,
                                today: {
                                    borderColor: "gray",
                                    borderWidth: 1,
                                }, // Add a border to today's date
                                selected: { backgroundColor: "gray" }, // Highlight the selected day
                                selected_label: { color: "white" }, // Highlight the selected day label
                            }}
                        />
                        <Pressable
                            onPress={() => {
                                setShowDatePicker(false);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 8,
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
        paddingHorizontal: 16,
        zIndex: 1,
    },
    container: {
        flex: 1,
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
    label: {
        color: "#eeeeee",
        fontSize: 12,
        marginBottom: 8,
    },
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
});
