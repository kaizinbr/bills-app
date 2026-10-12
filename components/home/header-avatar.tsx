import { useAuth } from "@/components/core/auth-provider";
import Avatar, { AvatarNoPress } from "@/components/user/avatar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
    Modal,
} from "react-native";
import TextDefault from "@/components/core/text-core";
import { useProfile } from "@/hooks/use-profile";

import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";

import * as Application from "expo-application";

import { Logout2Icon } from "@solar-icons/react-native/linear/logout-2";
import { UserIcon } from "@solar-icons/react-native/linear/user";
import { LockPasswordIcon } from "@solar-icons/react-native/linear/lock-password";
import { ShieldCheckIcon } from "@solar-icons/react-native/linear/shield-check";
import { InfoCircleIcon } from "@solar-icons/react-native/linear/info-circle";


import { Tuning2Icon } from '@solar-icons/react-native/linear/tuning-2'

export default function AvatarHeader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["80%", "100%"], []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [showLogout, setShowLogout] = useState(false);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);
    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.close();
    }, []);

    return (
        <>
            <Pressable
                onPress={handlePresentModalPress}
                style={styles.headerSlotLeft}
            >
                <Avatar size={28} />
            </Pressable>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // fecthData(true);
                }}
                snapPoints={snapPoints}
                backdropComponent={(backdropProps) => (
                    <BottomSheetBackdrop
                        {...backdropProps}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                    />
                )}
                enablePanDownToClose
                topInset={insets.top}
                backgroundStyle={{ backgroundColor: "#161718" }}
                handleIndicatorStyle={{ backgroundColor: "#555" }}
                // enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <AvatarNoPress size={116} fontSize={28} />
                        <TextDefault style={styles.nameText}>
                            {profile?.name}
                        </TextDefault>
                        <TextDefault>
                            v{Application.nativeApplicationVersion}
                        </TextDefault>
                        <View style={styles.menu}>
                            <Pressable style={styles.options} onPress={() => {
                                handleCloseModalPress();
                                router.push("/profile");
                            }}>
                                <UserIcon size={24} color="#fff" />
                                <TextDefault>Perfil</TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}>
                                <LockPasswordIcon size={24} color="#fff" />
                                <TextDefault>Segurança</TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}>
                                <ShieldCheckIcon size={24} color="#fff" />
                                <TextDefault>Privacidade</TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}>
                                <InfoCircleIcon size={24} color="#fff" />
                                <TextDefault>Sobre</TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    setShowLogout(true);
                                }}
                            >
                                <Logout2Icon size={24} color="#fff" />
                                <TextDefault>Sair</TextDefault>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <Modal
                visible={showLogout}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                }}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => {
                        // setShowDatePicker(false);
                        setShowLogout(false);
                    }}
                >
                    <View
                        style={styles.modalBox}
                        onStartShouldSetResponder={() => true}
                    >
                        <TextDefault
                            style={{
                                color: "#fff",
                                textAlign: "center",
                                fontWeight: "700",
                                fontSize: 16,
                                width: "100%",
                            }}
                        >
                            Tem certeza que deseja sair da sua conta?
                        </TextDefault>
                        <Pressable
                            onPress={() => {
                                setShowLogout(false);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#282828",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                                width: "48%",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Cancelar
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                authClient.signOut();
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: "#BE1E1E",
                                borderRadius: 999,
                                alignItems: "center",
                                justifyContent: "center",
                                width: "48%",
                                marginVertical: 8,
                            }}
                        >
                            <TextDefault style={{ color: "#fff" }}>
                                Sair
                            </TextDefault>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerSlotLeft: {
        width: "33%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    contentContainer: {
        flex: 1,
        paddingVertical: 24,
        paddingBottom: 64,
        alignItems: "center",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    nameText: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
    },
    legend: {
        fontSize: 12,
        marginTop: 8,
        color: "#aaa",
    },
    menu: {
        width: "100%",
        flexDirection: "column",
        marginTop: 16,
    },
    options: {
        width: "100%",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: "#555",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
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
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: "100%",
        maxWidth: 400,
        zIndex: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
});
