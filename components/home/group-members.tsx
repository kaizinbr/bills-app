import { useAuth } from "@/components/core/auth-provider";
import Avatar, { AvatarGeneric, AvatarNoPress } from "@/components/user/avatar";
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
import { useGroups, type GroupsResponse } from "@/hooks/use-group";

import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";

import * as Application from "expo-application";
import { SettingsIcon } from "@solar-icons/react-native/linear/settings";
import { Logout2Icon } from "@solar-icons/react-native/linear/logout-2";
import { UserIcon } from "@solar-icons/react-native/linear/user";
import { LockPasswordIcon } from "@solar-icons/react-native/linear/lock-password";
import { ShieldCheckIcon } from "@solar-icons/react-native/linear/shield-check";
import { InfoCircleIcon } from "@solar-icons/react-native/linear/info-circle";
import { AddCircleIcon } from "@solar-icons/react-native/linear/add-circle";
import { TrashBinMinimalisticIcon } from "@solar-icons/react-native/linear/trash-bin-minimalistic";
import { UserPlusIcon } from "@solar-icons/react-native/linear/user-plus";
import { CloseCircleIcon } from "@solar-icons/react-native/linear/close-circle";
import { PenNewRoundIcon } from "@solar-icons/react-native/linear/pen-new-round";

import { Tuning2Icon } from "@solar-icons/react-native/linear/tuning-2";

export default function GroupMembers({
    groupMembers,
}: {
    groupMembers: GroupsResponse["groups"][0]["groupMembers"];
}) {
    // console.log(selectedGroupId)
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { refetch } = useGroups();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["100%"], []);

    const bottomSheetManageRef = useRef<BottomSheetModal>(null);

    const [showSignout, setShowSignout] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

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

    return (
        <>
            <Pressable
                style={styles.iconButton}
                onPress={handleManageModalPress}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        gap: 4,
                    }}
                >
                    {groupMembers?.slice(0, 3).map((member, index) => (
                        <AvatarGeneric
                            name={member.user.name}
                            user={member.user}
                            key={member.id}
                            size={20}
                            fontSize={12}
                        />
                    ))}
                    <TextDefault style={styles.invoiceText} numberOfLines={1}>
                        {groupMembers?.length} membro
                        {groupMembers?.length !== 1 ? "s" : ""}
                    </TextDefault>
                </View>
            </Pressable>
            <BottomSheetModal
                ref={bottomSheetManageRef}
                onChange={handleSheetChanges}
                onDismiss={() => {
                    // fecthData(true);
                }}
                // snapPoints={snapPoints}
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
                <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.content}>
                        <TextDefault style={styles.headerText}>
                            Membros do grupo
                        </TextDefault>
                        <View style={styles.menu}>
                            {groupMembers?.map((member) => {
                                return (
                                    <Pressable
                                        key={member.id}
                                        style={[styles.options]}
                                    >
                                        <AvatarGeneric
                                            name={member.user.name}
                                            user={member.user}
                                            size={32}
                                            fontSize={12}
                                        />
                                        <TextDefault
                                            style={[
                                                styles.optionsText,
                                                {
                                                    color: "#fff",
                                                },
                                            ]}
                                        >
                                            {member.user.name}
                                        </TextDefault>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
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
    headerText: {
        fontSize: 16,
        fontWeight: "700",
        // color: "#00D0A3",
        width: "100%",
        paddingHorizontal: 24,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: "#555",
    },
    optionsText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#B3B3B3",
    },
    contentContainer: {
        flex: 1,
        paddingBottom: 64,
        paddingTop: 24,
    },

    invoiceText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "500",
    },
    content: {
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
        justifyContent: "flex-start",
    },

    icon: {
        color: "#fff",
        fontSize: 25,
    },
});
