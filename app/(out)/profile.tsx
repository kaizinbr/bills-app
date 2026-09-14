import api from "@/lib/api";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    Animated,
    RefreshControl
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";

import Input from "@/components/core/input";

import { formatMoneyInput } from "@/app/(out)/create-purchase";

import { LinearGradient } from "expo-linear-gradient";

import BackBtn from "@/components/core/back-btn";
import { parseAmountToCents } from "@/components/purchases/edit-purchase-bottomsheet";
import { useCreateGroup } from "@/hooks/use-create-group";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker, {
    DateType,
    useDefaultStyles,
} from "react-native-ui-datepicker";

import { useProfile } from "@/hooks/use-profile";
import Avatar, { AvatarNoPress } from "@/components/user/avatar";

export default function CreateGroup() {
    const router = useRouter();

    const { data: profile, isLoading, refetch, isFetching } = useProfile();

    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    
    const onRefresh = async () => {
        try {
            await refetch();
        } catch (error) {
            console.error("Error refreshing profile data:", error);
        }
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
                    <Animated.ScrollView
                        horizontal={false}
                        contentContainerStyle={{
                            paddingBottom: 64,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 16,
                            paddingTop: insets.top + 64,
                        }}
                        style={[styles.container]}
                        refreshControl={
                                            <RefreshControl
                                                refreshing={isFetching}
                                                onRefresh={onRefresh}
                                                progressViewOffset={
                                                    Platform.OS === "android"
                                                        ? 64 + insets.top
                                                        : 0
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
                        <LinearGradient
                            colors={["#009C7A", "#161718"]}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: insets.top + 164,
                                zIndex: -5,
                                opacity: 0.5,
                            }}
                        />
                        
                        <View
                            style={{
                                width: "100%",
                                alignItems: "center",
                                gap: 16,
                                paddingHorizontal: 16,
                            }}
                        >
                            <AvatarNoPress size={64} fontSize={28} />
                            <TextDefault style={styles.title}>{profile?.name}</TextDefault>
                            <TextDefault style={styles.description}>
                                Compartilhe o código de convite abaixo com a
                                pessoa que deseja adicionar a essa conta.
                            </TextDefault>
                                <Pressable
                                    // onPress={copyToClipboard}
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
                                        style={{
                                            color: "#fff",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Editar Perfil
                                    </TextDefault>
                                </Pressable>
                        </View>

                    </Animated.ScrollView>
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
        // paddingHorizontal: 16,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        paddingHorizontal: 16,
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
