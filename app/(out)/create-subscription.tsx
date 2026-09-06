// app/create-subscription.tsx
import api from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/core/auth-provider";
import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import { AltArrowLeftIcon } from "@solar-icons/react-native/linear/alt-arrow-left";
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
import PopoverCards from "@/components/purchases/popover-cards";
import PopoverUsers from "@/components/purchases/popover-users";
import PopoverCategories from "@/components/purchases/popover-categories";
import { Host, Switch } from "@expo/ui/jetpack-compose";

function formatMoneyInput(digits: string) {
    if (!digits) return "";
    const paddedDigits = digits.padStart(3, "0");
    const integerPart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
    const decimalPart = paddedDigits.slice(-2);
    return `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
}

export default function CreateSubscription() {
    const router = useRouter();
    const local = useLocalSearchParams();
    const groupId = local.groupId as string;

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState<any>(null);

    const [description, setDescription] = useState("");
    const [amountCents, setAmountCents] = useState("");
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    const [mySubscription, setMySubscription] = useState<boolean>(true);
    const [subscriptionOwner, setSubscriptionOwner] = useState<string | null>(currentUserId!);

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await api.get("/users");
                setUsers(usersResponse.data.users);

                const groupsResponse = await api.get(`groups/${groupId}`);
                setGroupData(groupsResponse.data.group);
                setCards(groupsResponse.data.group?.cards ?? []);

                const categoriesResponse = await api.get(`categories`);
                setCategories(categoriesResponse.data.categories);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleCreateSubscription = async () => {
        try {
            const resolvedOwner = mySubscription ? currentUserId : subscriptionOwner;

            if (!resolvedOwner || !category) {
                console.warn("Selecione o dono e a categoria antes de criar a assinatura.");
                return;
            }

            await api.post("/subscriptions", {
                groupId,
                description,
                amount: amountCents,
                cardId: selectedCardId,
                categoryId: category,
                ownerId: resolvedOwner,
            });
            router.back();
        } catch (error) {
            console.error("Error creating subscription:", error);
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
                        contentContainerStyle={{
                            paddingBottom: 32,
                            alignItems: "flex-start",
                            gap: 8,
                            paddingTop: insets.top + 32,
                        }}
                        style={styles.container}
                    >
                        <Pressable onPress={() => router.back()}>
                            <AltArrowLeftIcon size={24} color="#fff" />
                        </Pressable>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Conta</TextDefault>
                            <TextDefault>{groupData?.name}</TextDefault>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Nome da assinatura</TextDefault>
                            <Input
                                placeholder="Netflix, Spotify..."
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Valor mensal</TextDefault>
                            <Input
                                placeholder="R$ 0,00"
                                value={formatMoneyInput(amountCents)}
                                onChangeText={(text) => setAmountCents(text.replace(/\D/g, "").slice(0, 10))}
                                keyboardType="number-pad"
                                inputMode="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Cartão</TextDefault>
                            <PopoverCards
                                items={cards}
                                selectedId={selectedCardId}
                                onSelect={setSelectedCardId}
                                placeholder="Sem cartão"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.label}>Categoria</TextDefault>
                            <PopoverCategories
                                items={categories}
                                selectedId={category}
                                onSelect={setCategory}
                                placeholder="Selecione a categoria"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Host matchContents>
                                    <Switch value={mySubscription} onCheckedChange={setMySubscription} />
                                </Host>
                                <TextDefault style={{ marginLeft: 8 }}>Assinatura é minha</TextDefault>
                            </View>
                        </View>

                        {!mySubscription && (
                            <View style={styles.inputContainer}>
                                <TextDefault style={styles.label}>De quem é a assinatura</TextDefault>
                                <PopoverUsers
                                    items={users}
                                    selectedId={subscriptionOwner}
                                    onSelect={setSubscriptionOwner}
                                    placeholder="Selecione o usuário"
                                />
                            </View>
                        )}

                        <Pressable
                            onPress={handleCreateSubscription}
                            style={{
                                marginTop: 16,
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 8,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>Criar assinatura</TextDefault>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: "#161718" },
    keyboardContainer: { flex: 1, paddingHorizontal: 16, zIndex: 1 },
    container: { flex: 1, zIndex: 1 },
    inputContainer: { marginTop: 16, width: "100%" },
    label: { color: "#eeeeee", fontSize: 12, marginBottom: 8 },
});