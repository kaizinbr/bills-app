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
import api from "@/lib/api";
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
import { AddCircleIcon } from '@solar-icons/react-native/linear/add-circle';
import { TrashBinMinimalisticIcon } from "@solar-icons/react-native/linear/trash-bin-minimalistic";
import { UserPlusIcon } from "@solar-icons/react-native/linear/user-plus";
import { PenNewRoundIcon } from "@solar-icons/react-native/linear/pen-new-round";

import { Tuning2Icon } from "@solar-icons/react-native/linear/tuning-2";

export default function GroupManager({
    selectedGroupId,
}: {
    selectedGroupId: string;
}) {
    console.log(selectedGroupId)
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["80%", "100%"], []);

    const bottomSheetManageRef = useRef<BottomSheetModal>(null);

    const [showLogout, setShowLogout] = useState(false);

    // modal principal
    const handleManageModalPress = useCallback(() => {
        bottomSheetManageRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetManageRef.current?.close();
    }, []);

    // bottom sheet compartilhar 
    const bottomSheetShareRef = useRef<BottomSheetModal>(null);
    
    const handleShareModalPress = useCallback(() => {
        bottomSheetShareRef.current?.present();
    }, []);

    const handleDeleteGroup = useCallback(async () => {
        try {
            await api.delete(`/groups/${selectedGroupId}`);
            setShowLogout(false);
            router.replace("/(tabs)/home");
        }
        catch (error) {
            console.error("Error deleting group:", error);
        }
        finally {
            setShowLogout(false);
        }
    }, [selectedGroupId, router]);

    return (
        <>
            <Pressable
                style={styles.iconButton}
                onPress={handleManageModalPress}
            >
                <Tuning2Icon size={24} color="#fff" />
            </Pressable>
            <BottomSheetModal
                ref={bottomSheetManageRef}
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
                enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <View style={styles.menu}>
                            <Pressable style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    router.push({
                                        pathname: `/share/[id]`,
                                        params: { id: selectedGroupId as string },
                                    });
                                }}
                            >
                                <AddCircleIcon size={24} color="#fff" />
                                <TextDefault>
                                    Adicionar membro à conta
                                </TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    router.push({
                                        pathname: `/edit-group/[id]`,
                                        params: { id: selectedGroupId as string },
                                    });
                                }}
                            >
                                <PenNewRoundIcon size={24} color="#fff" />
                                <TextDefault>Editar conta</TextDefault>
                            </Pressable>
                            <Pressable
                                style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    setShowLogout(true);
                                }}
                            >
                                <TrashBinMinimalisticIcon
                                    size={24}
                                    color="#fff"
                                />
                                <TextDefault>Excluir conta</TextDefault>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            
            {/* <BottomSheetModal
                ref={bottomSheetShareRef}
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
                enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <View style={styles.menu}>
                            <Pressable style={styles.options}>
                                <AddCircleIcon size={24} color="#fff" />
                                <TextDefault>
                                    Adicionar membro à conta
                                </TextDefault>
                            </Pressable>
                            <Pressable style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    router.push(`/edit-group?id=${selectedGroupId}`);
                                }}
                            >
                                <PenNewRoundIcon size={24} color="#fff" />
                                <TextDefault>Editar conta</TextDefault>
                            </Pressable>
                            <Pressable
                                style={styles.options}
                                onPress={() => {
                                    handleCloseModalPress();
                                    setShowLogout(true);
                                }}
                            >
                                <TrashBinMinimalisticIcon
                                    size={24}
                                    color="#fff"
                                />
                                <TextDefault>Excluir conta</TextDefault>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal> */}

            <Modal
                visible={showLogout}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {}}
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
                            Tem certeza que deseja excluir esta conta?
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
                                handleDeleteGroup();
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
                                Excluir
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
        padding: 0,
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
        padding: 16,
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
        padding: 16,
        width: "100%",
        maxWidth: 400,
        zIndex: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },

    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        width: "33%",
        // backgroundColor: "red",
    },
    iconButton: {
        width: "33%",
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },

    icon: {
        color: "#fff",
        fontSize: 25,
    },
});
