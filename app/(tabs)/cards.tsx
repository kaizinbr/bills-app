console.log("módulo cards carregado");

import api from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    ScrollViewInstance,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackBtn from "@/components/core/back-btn";

import { CardIcon } from "@solar-icons/react-native/linear/card";
import GroupSelectMenu from "@/components/home/group-select-menu";
import { useGroups } from "@/hooks/use-group";
import { useSelectedGroup } from "@/components/core/select-group-context";

export default function Cards() {
    console.log("groupId");
    const router = useRouter();

    const { data, refetch, isFetching } = useGroups();

    const { session } = useAuth();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(false);
    const { selectedGroupId, setSelectedGroupId, isLoaded } =
            useSelectedGroup();

            
                const scrollRef = useRef<ScrollViewInstance>(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerTranslateY = Animated.diffClamp(scrollY, 0, 64).interpolate({
        inputRange: [0, 64],
        outputRange: [0, -(64 + insets.top)],
        extrapolate: "clamp",
    });

    const fetchData = async () => {
        try {
            const response = await api.get(`/groups/${selectedGroupId}/cards`);
            setCards(response.data.cards);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedGroupId]);

    return (
        <View style={styles.main}>
            <StatusBar />
            <Animated.View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        height: 64 + insets.top,
                        transform: [
                            {
                                translateY: menuOpen
                                    ? 0
                                    : showHeader
                                      ? 0
                                      : headerTranslateY,
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.headerTop}>
                    <GroupSelectMenu
                        data={data}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        selectedGroupId={selectedGroupId}
                        setSelectedGroupId={setSelectedGroupId}
                        scrollRef={scrollRef}
                        setShowHeader={setShowHeader}
                        customStyles={{ maxWidth: "50%" }}
                    />
                </View>
            </Animated.View>
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"#00c89b"} size={"large"} />
                </View>
            ) : (
                <ScrollView
                    horizontal={false}
                    contentContainerStyle={{
                        paddingBottom: 32,
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 0,
                        paddingTop: insets.top + 64,
                    }}
                    showsVerticalScrollIndicator={false}
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchData}
                            progressViewOffset={
                                Platform.OS === "android" ? 64 + insets.top : 0
                            }
                            progressBackgroundColor="#282828"
                            colors={["#5E8C61", "#5E8C61"]}
                            style={{
                                borderWidth: 0.5,
                                borderColor: "#56595D",
                            }}
                        />
                    }
                >
                    {cards.length === 0 ? (
                        <TextDefault
                            style={{ color: "#fff", paddingHorizontal: 24 }}
                        >
                            Nenhum cartão encontrado. Adicione um novo cartão.
                        </TextDefault>
                    ) : (
                        cards.map((card: any) => (
                            <Pressable
                                key={card.id}
                                style={({ pressed }) => [
                                    styles.item,
                                    {
                                        backgroundColor: pressed
                                            ? "#282828"
                                            : "#161718",
                                    },
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: `/card/[id]`,
                                        params: { id: card.id },
                                    })
                                }
                            >
                                <View
                                    style={[
                                        styles.cardIconContainer,
                                        {
                                            backgroundColor:
                                                card.color || "#282828",
                                        },
                                    ]}
                                >
                                    <CardIcon size={20} color="white" />
                                </View>
                                <View>
                                    <TextDefault style={styles.cardTitle}>
                                        {card.name}
                                    </TextDefault>
                                    <TextDefault style={styles.description}>
                                        {card.digits}
                                    </TextDefault>
                                </View>
                            </Pressable>
                        ))
                    )}
                </ScrollView>
            )}

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
                                marginBottom: 8,
                            }}
                        >
                            {error}
                        </TextDefault>
                        <TextDefault
                            style={{ color: "#fff", textAlign: "center" }}
                        >
                            Verifique se todos os campos obrigatórios foram
                            preenchidos e tente novamente.
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
                            <TextDefault style={{ color: "#fff" }}>
                                Fechar
                            </TextDefault>
                        </Pressable>
                    </View>
                </View>
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerTop: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inputContainer: {
        marginTop: 16,
        width: "100%",
        minWidth: "100%",
        paddingHorizontal: 24,
    },
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
    cardButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
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
    catButtonSelected: {
        borderWidth: 2,
        borderColor: "#009C7A",
        backgroundColor: "#0B3D22",
    },
    catButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        position: "absolute",
        bottom: 32,
        left: 24,
        right: 24,
        zIndex: 10,
        alignItems: "center",
    },

    item: {
        flexDirection: "row",
        // justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
        width: "100%",
    },

    buttons: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#282828",
        borderRadius: 8,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        color: "#eee",
    },
    description: {
        fontSize: 12,
        color: "#aaa",
    },
    cardIconContainer: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
});
