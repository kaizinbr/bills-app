import { View, Text, StyleSheet } from "react-native";
import TextDefault from "@/components/core/text-core";

export default function CreateGroup() {
    return (
        <View style={styles.container}>
            <TextDefault style={styles.title}>Create Group</TextDefault>
            <TextDefault style={styles.description}>
                This is the Create Group .
            </TextDefault>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#161718",
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
});