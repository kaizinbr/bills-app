import { Text, View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import TextDefault from "@/components/core/text-core";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Groups() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    const [creditorGroups, setCreditorGroups] = useState([]);
    const [debtorGroups, setDebtorGroups] = useState([]);

    const [cards, setCards] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get("/groups");
                setCreditorGroups(response.data.creditorGroups);
                setDebtorGroups(response.data.debtorGroups);
                setCards(response.data.creditorGroups[0].cards);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        fetchGroups();
    }, []);

    return (
        <View style={styles.container}>
            <Link href="/create-group" style={{ marginBottom: 16, padding: 12, backgroundColor: "#007bff", borderRadius: 8 }}>
                <TextDefault style={styles.title}>Create New Group</TextDefault>
            </Link>
            <TextDefault style={styles.title}>Creditor Groups (eu pago)</TextDefault>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                creditorGroups.map((group: any) => (
                <>
                    <View key={group.id} style={styles.groupItem}>
                    <TextDefault style={styles.groupName}>
                        {group.name}
                    </TextDefault>
                    <TextDefault style={styles.groupName}>
                        Total: R$0,00
                    </TextDefault>
                    <TextDefault style={styles.groupName}>
                        Fecha dia {group.closingDay}
                    </TextDefault>
                    <TextDefault style={styles.groupName}>
                        Pagar a: {group.debtor?.name}
                    </TextDefault>
                    <TextDefault style={styles.groupName}>
                        Cartões: {group.cards?.length || 0}
                    </TextDefault>
                    <Pressable
                        onPress={() => router.push({
                            pathname: "/create-card/[groupId]",
                            params: { groupId: group.id },
                        })}
                        style={{ marginTop: 8, padding: 8, backgroundColor: "#323232", borderRadius: 4 }}
                    >
                        <TextDefault style={{ color: "#fff" }}>Criar cartão</TextDefault>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push({
                            pathname: "/create-card/[groupId]",
                            params: { groupId: group.id },
                        })}
                        style={{ marginTop: 8, padding: 8, backgroundColor: "#323232", borderRadius: 4 }}
                    >
                        <TextDefault style={{ color: "#fff" }}>Criar compra</TextDefault>
                    </Pressable>
                </View>
                {cards.length > 0 && cards.map((card: any) => (
                    <View key={card.id} style={[styles.groupItem, { backgroundColor: card.color || "#282828" }]}>
                        <TextDefault style={styles.groupName}>
                            {card.name}
                        </TextDefault>
                    </View>
                ))}
                </>)
            ))}

            {/* <TextDefault style={styles.title}>Debtor Groups (eu recebo)</TextDefault>
            {debtorGroups.map((group: any) => (
                <View key={group.id} style={styles.groupItem}>
                    <TextDefault style={styles.groupName}>
                        {group.name}
                    </TextDefault>
                </View>
            ))} */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 16,
        gap: 16,
        width: "100%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    groupItem: {
        padding: 12,
        backgroundColor: "#282828",
        borderRadius: 8,
        marginBottom: 8,
        width: "100%",
        aspectRatio: 5/3, // Adjust the aspect ratio as needed
    },
    groupName: {
        fontSize: 16,
    },
});
