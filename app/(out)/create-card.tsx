import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import { AltArrowLeftIcon } from "@solar-icons/react-native/linear/alt-arrow-left";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Input from "@/components/core/input";

import { Host, Switch, Text, ToggleButton } from "@expo/ui/jetpack-compose";

import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";

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

export default function CreateCard() {
    const router = useRouter();
    const local = useLocalSearchParams();
    console.log("Local search params:", local.groupId);
    const groupId = local.groupId as string;

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    let today = new Date();
    const defaultStyles = useDefaultStyles();

    const [groupData, setGroupData] = useState<any>(null);

    const [cardName, setCardName] = useState("");
    const [cardColor, setCardColor] = useState("#820AD1");
    const [cardOwner, setCardOwner] = useState("");

    const [myCard, setMyCard] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);

    const [digits, setDigits] = useState("");

    const [canSubmit, setCanSubmit] = useState(false);

    const handleTextChange = (text: string) => {
        // Strips out everything except digits 0-9
        const cleanedText = text.replace(/[^0-9]/g, "");
        setDigits(cleanedText);
    };

    useEffect(() => {
        if (
            cardName.trim() !== "" &&
            cardColor.trim() !== "" &&
            digits.trim() !== ""
        ) {
            setCanSubmit(true);
        }
    }, [cardName, cardColor, digits]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data.users);

                const groupsResponse = await api.get(`groups/${groupId}`);
                setGroupData(groupsResponse.data.group);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleCreateCard = async () => {
        try {
            const resolvedOwner = myCard ? currentUserId : cardOwner;

            // if (!resolvedOwner) {
            //     console.warn(
            //         "Selecione o proprietário do cartão antes de criar o cartão.",
            //     );
            //     return;
            // }

            const response = await api.post("/cards", {
                name: cardName,
                color: cardColor,
                ownerId: resolvedOwner,
                groupId: groupId,
                digits: digits,
            });
            console.log("Group created:", response.data);
        } catch (error) {
            console.error("Error creating group:", error);
        }
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
                            paddingTop: insets.top + 24,
                        }}
                        showsVerticalScrollIndicator={false}
                        style={[styles.container]}
                    >
                        <Pressable
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <AltArrowLeftIcon size={24} color="#fff" />
                        </Pressable>
                        <TextDefault style={styles.title}>
                            Criar cartão
                        </TextDefault>
                        <View
                            style={{
                                paddingHorizontal: 16,
                            }}
                        >
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

                        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                            <View
                                style={{
                                    aspectRatio: 5 / 3,
                                    borderRadius: 16,
                                    backgroundColor: cardColor,
                                    height: 96,
                                    padding: 12,
                                    justifyContent: "flex-end",
                                    flexDirection: "column",
                                }}
                            >
                                <TextDefault
                                    style={{ color: "#fff", fontWeight: "600" }}
                                >
                                    {cardName || "Nome do Cartão"}
                                </TextDefault>
                                <TextDefault
                                    style={{ color: "#fff", fontWeight: "600" }}
                                >
                                    {digits || "1234"}
                                </TextDefault>
                            </View>
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Nome do Cartão
                            </TextDefault>
                            <Input
                                placeholder="Ourocard de kaio"
                                value={cardName}
                                onChangeText={setCardName}
                            />
                        </View>
                        <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Últimos dígitos do Cartão
                            </TextDefault>
                            <Input
                                placeholder="1234"
                                value={digits}
                                onChangeText={handleTextChange}
                                keyboardType="number-pad"
                                maxLength={4}
                            />
                        </View>
                        {/* <View style={[styles.inputContainer]}>
                            <TextDefault style={styles.label}>
                                Dono do cartão
                            </TextDefault>
                            <Host matchContents>
                                <ToggleButton
                                    checked={myCard}
                                    onCheckedChange={setMyCard}
                                >
                                    <Text>O cartão é meu</Text>
                                </ToggleButton>
                            </Host>
                            {!myCard &&
                                users.length > 0 &&
                                users.map((user) => (
                                    <Pressable
                                        key={user.id}
                                        onPress={() =>
                                            setCardOwner(
                                                cardOwner === user.id
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
                                                cardOwner === user.id
                                                    ? "#007AFF"
                                                    : "#333333",
                                        }}
                                    >
                                        <TextDefault>{user.name}</TextDefault>
                                    </Pressable>
                                ))}
                        </View> */}
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
                                        onPress={() => setCardColor(color.hex)}
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
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            <Pressable
                onPress={handleCreateCard}
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
                    Criar cartão
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

    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    backButton: {
        paddingHorizontal: 16,
    },
    container: {
        flex: 1,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 16,
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
        padding: 12,
        borderWidth: 1,
        borderColor: "#262626",
        backgroundColor: "#212223",
        borderRadius: 12,
        color: "#eeeeee",
        fontFamily: "Walsheim",
        fontWeight: 400,
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
