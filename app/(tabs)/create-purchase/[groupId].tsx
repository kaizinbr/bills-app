import api from "@/lib/api";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

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

export default function CreateCard() {
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

            if (!resolvedOwner) {
                console.warn(
                    "Selecione o proprietário do cartão antes de criar o cartão.",
                );
                return;
            }

            const response = await api.post("/cards", {
                name: cardName,
                color: cardColor,
                ownerId: resolvedOwner,
                groupId: groupId,
                // closingDay: groupClosingDate
                //     ? new Date(groupClosingDate as string).getUTCDate()
                //     : undefined,
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
                    <TextDefault style={styles.title}>Criar cartão</TextDefault>
                    <TextDefault style={styles.description}>
                        Esta é a tela de criação de cartão.
                    </TextDefault>

                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>Grupo</TextDefault>
                        <TextDefault>{groupData?.name}</TextDefault>

                    </View>
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Nome do Cartão
                        </TextDefault>
                        <Input
                            placeholder="Nome do cartão"
                            // style={[styles.input]}
                            value={cardName}
                            onChangeText={setCardName}
                        />
                    </View>
                    <View style={[styles.inputContainer]}>
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

                    </View>
                    
                    <View style={[styles.inputContainer]}>
                        <TextDefault style={styles.label}>
                            Cor do Cartão
                        </TextDefault>
                        <Input
                            placeholder="Cor do cartão"
                            value={cardColor}
                            onChangeText={setCardColor}
                        />
                    </View>
                    <Pressable
                        onPress={handleCreateCard}
                        style={{
                            padding: 12,
                            backgroundColor: "#282828",
                            borderRadius: 8,
                            marginTop: 16,
                        }}
                    >
                        <TextDefault style={{ color: "#fff" }}>
                            Criar cartão
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
