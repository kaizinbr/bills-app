import { View, Text, StyleSheet } from "react-native";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function OfflineBadge() {
    const isConnected = useNetworkStatus();
    if (isConnected) return null;

    return (
        <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.text}>Sem conexão</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#2A2A2A",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#B3B3B3" },
    text: { color: "#FFFFFF", fontSize: 12, fontWeight: "500" },
});
