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

interface Group {
    id: string;
    name: string;
}
interface PopoverMenuData {
    creditorGroups?: Group[];
    debtorGroups?: Group[];
}

export default function GroupSelectMenu({
    data,
    menuOpen,
    setMenuOpen,
    selectedGroupId,
    setSelectedGroupId,
    scrollRef,
    setShowHeader,
}: {
    data?: PopoverMenuData;
    menuOpen: boolean;
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedGroupId: string | null;
    setSelectedGroupId: (groupId: string) => void;
    scrollRef: React.RefObject<ScrollView> | any;
    setShowHeader: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["80%", "100%"], []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const [internalOpen, setInternalOpen] = useState(false);
    const open = menuOpen ?? internalOpen;
    const setOpen = setMenuOpen ?? setInternalOpen;

    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const buttonRef = useRef<View>(null);

    const openMenu = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height });
            setOpen(true);
        });
    };

    // const selectedItem = items.find((item) => item.id === selectedId);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const allGroups = useMemo(
        () => [...(data?.creditorGroups ?? []), ...(data?.debtorGroups ?? [])],
        [data],
    );

    const selectedGroup =
        allGroups.find((group) => group.id === selectedGroupId) ??
        allGroups[0] ??
        null;

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    return (
        <>
            <Pressable
                onPress={handlePresentModalPress}
                style={styles.headerButton}
            >
                <TextDefault style={styles.headerButtonTitle} numberOfLines={1}>
                    {selectedGroup?.name ?? "Selecionar conta"}
                </TextDefault>
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
                enableDynamicSizing={false}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.content}>
                        <TextDefault style={styles.headerText}>
                            Selecione a conta que deseja visualizar:
                        </TextDefault>
                        <View style={styles.menu}>
                            {allGroups.map((group) => (
                                <Pressable
                                    key={group.id}
                                    style={[
                                        styles.options,
                                    ]}
                                    onPress={() => {
                                        setSelectedGroupId(group.id);
                                        setMenuOpen(false);
                                        scrollToTop();
                                        bottomSheetModalRef.current?.dismiss();
                                    }}
                                >
                                    <TextDefault
                                        style={[
                                            styles.optionsText,
                                            group.id === selectedGroupId && {
                                                fontWeight: "700",
                                                color: "#009C7A"
                                            },
                                        ]}
                                    >
                                        {group.name}
                                    </TextDefault>
                                </Pressable>
                            ))}

                            <Pressable
                                style={styles.options}
                                onPress={() => {
                                    router.push("/(tabs)/create-group");
                                    setMenuOpen(false);
                                    bottomSheetModalRef.current?.dismiss();
                                }}
                            >
                                <TextDefault style={styles.optionsText}>
                                    Criar nova conta
                                </TextDefault>
                            </Pressable>
                        </View>
                    </View>
                </BottomSheetView>
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
    headerButton: {
        maxWidth: "100%",
        backgroundColor: "#2b2b2b",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        borderWidth: 1,
        borderColor: "#3a3a3a",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    headerButtonTitle: {
        flexShrink: 1,
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    contentContainer: {
        flex: 1,
        padding: 0,
        alignItems: "center",
    },
    content: {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
    },
    headerText: {
        fontSize: 14,
        marginTop: 8,
        paddingHorizontal: 16,
    },
    menu: {
        width: "100%",
        flexDirection: "column",
        marginTop: 16,
    },
    options: {
        width: "100%",
        padding: 16,
        // borderBottomWidth: 0.5,
        // borderBottomColor: "#555",
    },
    optionsText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
});
