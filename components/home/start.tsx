import { useAuth } from "@/components/core/auth-provider";
import Avatar from "@/components/user/avatar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useRouter } from "expo-router";

const HEADER_HEIGHT = 64;

export default function FromTheStart() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Parece que não tem nada por aqui ainda...</Text>
            <Pressable style={styles.button} onPress={() => router.push("/create-group")}>
                <Text style={{ color: "#eeeeee" }}>Criar primeira conta</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 32,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#eeeeee",
        // fontSize: 16,
    },
    button: {
        backgroundColor: "#4a4a4a",
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#3a3a3a",
    }
});
