import api from "@/lib/api";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
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

import BackBtn from "@/components/core/back-btn";
import { useCreateGroup } from "@/hooks/use-create-group";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateType, useDefaultStyles } from "react-native-ui-datepicker";

export default function CreateGroup() {
    const router = useRouter();

    const local = useLocalSearchParams();
    const id = local.id as string; // id da compra, se for edição
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
    const [inviteCode, setInviteCode] = useState("");
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
        const isValid = groupName.trim() !== "" && amountCents.trim() !== "";
        setCanSubmit(isValid);
    }, [groupName, amountCents, groupClosingDate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/groups/${id}`);
                const group = response.data.group;
                console.log("Fetched group data:", group);

                setGroupName(group.name);
                setInviteCode(group.inviteCode);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching group data:", error);
            }
        };

        fetchData();
    }, []);

    const copyToClipboard = async () => {
        try {
            await Clipboard.setStringAsync(inviteCode);
        } catch (error) {
            console.error("Error copying to clipboard:", error);
        }
    };

    const shareInviteCode = async () => {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(inviteCode);
            } else {
                console.error("Sharing is not available on this device");
            }
        } catch (error) {
            console.error("Error sharing invite code:", error);
        }
    };

    const handleUpdateGroup = () => {
        if (!canSubmit) return;
        setLoading(true);

        const groupData = {
            name: groupName,
            limit: amountCents,
            closingDay: new Date(groupClosingDate as string).getUTCDate(),
        };

        api.patch(`/groups/${id}`, groupData)
            .then((response) => {
                console.log("Group updated successfully:", response.data);
                router.push("/");
            })
            .catch((error) => {
                console.error("Error updating group:", error);
            });
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
                            gap: 16,
                            paddingTop: insets.top + 64,
                        }}
                        style={[styles.container]}
                    >
                        <TextDefault style={styles.title}>
                            Adicionar membro a {groupName}
                        </TextDefault>
                        <TextDefault style={styles.description}>
                            Compartilhe o código de convite abaixo com a pessoa
                            que deseja adicionar a essa conta.
                        </TextDefault>
                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>
                                Código de convite
                            </TextDefault>
                            <TextDefault style={styles.code} selectable>
                                {inviteCode}
                            </TextDefault>
                            <Pressable
                                onPress={copyToClipboard}
                                style={({ pressed }) => [
                                    styles.submitBtn,
                                    {
                                        // bottom: insets.bottom + 16,
                                        // opacity: canSubmit ? 1 : 0.5,
                                        backgroundColor: pressed
                                            ? "#007B5E"
                                            : "#009C7A",
                                    },
                                ]}
                                // disabled={!canSubmit}
                            >
                                <TextDefault
                                    style={{ color: "#fff", fontWeight: "700" }}
                                >
                                    Copiar código
                                </TextDefault>
                            </Pressable>
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
    },
    description: {
        fontSize: 14,
    },
    inputContainer: {
        width: "100%",
        minWidth: "100%",
        backgroundColor: "#142825",
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
        textAlign: "center",
    },
    code: {
        color: "#eeeeee",
        fontSize: 28,
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        letterSpacing: 4,
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
        width: "100%",
        alignItems: "center",
    },
});
