import { useAuth } from "@/components/core/auth-provider";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ComponentRef,
} from "react";
import {
    Animated,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Groups from "@/components/home/groups";
import { useGroups } from "@/hooks/use-group";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import type { GroupsHandle } from "@/components/home/groups";

import CreatePurchase from "@/components/home/float-btn";
import AvatarHeader from "@/components/home/header-avatar";
import FromTheStart from "@/components/home/start";

import GroupManager from "@/components/home/group-manager";
import GroupSelectMenu from "@/components/home/group-select-menu";

import { LinearGradient } from "expo-linear-gradient";

import { useSelectedGroup } from "@/components/core/select-group-context";
import StatusBar from "@/components/core/status-bar";

const HEADER_HEIGHT = 64;

const BG_START = 100;
const BG_END = 160;
const PAGE_BG = "#161718";
const PAGE_BG_TRANSPARENT = "#16171800";
const GRADIENT_LEFT = "#00C89B";
const GRADIENT_LEFT_FADE = "transparent";
const GRADIENT_RIGHT = "#0AAEB0";
const GRADIENT_RIGHT_FADE = "transparent";

export default function Home() {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const { data, refetch, isFetching } = useGroups();

    const [updatedAt, setUpdatedAt] = useState(Date.now());
    const [showHeader, setShowHeader] = useState(false);

    const groupsRef = useRef<GroupsHandle>(null);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const { height } = useWindowDimensions();
    const HEADER_MAX_HEIGHT = height * 0.4;

    const insets = useSafeAreaInsets();

    const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

    // Distância de scroll até o topo do conteúdo
    const scrollY = useRef(new Animated.Value(0)).current;
    const { selectedGroupId, setSelectedGroupId, isLoaded } =
        useSelectedGroup();

    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const groups = useMemo(() => data?.groups ?? [], [data]);

    const selectedGroup =
        groups.find((group) => group.id === selectedGroupId) ??
        groups[0] ??
        null;

    useEffect(() => {
        if (!isLoaded) return; // ainda lendo do storage, não decide nada ainda

        const stillExists = groups.some((g) => g.id === selectedGroupId);
        if ((!selectedGroupId || !stillExists) && groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        }
    }, [groups, selectedGroupId, isLoaded]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const timeout = setTimeout(() => {
            setMenuOpen(false);
        }, 10000);

        return () => clearTimeout(timeout);
    }, [menuOpen]);

    const headerTranslateY = Animated.diffClamp(
        scrollY,
        0,
        HEADER_HEIGHT,
    ).interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -(HEADER_HEIGHT + insets.top)],
        extrapolate: "clamp",
    });

    const floatbBtnTranslateY = Animated.diffClamp(
        scrollY,
        0,
        HEADER_HEIGHT,
    ).interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, 100],
        extrapolate: "clamp",
    });

    // 0 = transparente (topo), 1 = fundo sólido (depois de BG_END de scroll)
    // Usado tanto no fundo do menu quanto na status bar.
    const bgOpacity = scrollY.interpolate({
        inputRange: [BG_START, BG_END],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const headerBorder = scrollY.interpolate({
        inputRange: [BG_START, BG_END],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    const isFetchingGroupData = useIsFetching({
        predicate: (query) =>
            query.queryKey[0] === "groups" ||
            (query.queryKey[0] === "group" &&
                query.queryKey[1] === selectedGroupId) ||
            query.queryKey[0] === "invoice",
    });

    useEffect(() => {
        if (!selectedGroupId) return;

        setShowHeader(false);
        setMenuOpen(false);

        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ y: 0, animated: false });
            scrollY.setValue(0);
        });
    }, [selectedGroupId, scrollY]);

    const onRefresh = useCallback(() => {
        setShowHeader(true);
        refetch(); // groups
        groupsRef.current?.refreshInvoiceData(); // invoices + purchases + total da fatura selecionada
        setUpdatedAt(Date.now());
        setTimeout(() => {
            setShowHeader(false);
        }, 1000);
    }, [refetch]);

    return (
        <View style={styles.box}>
            {/* Fundo da status bar: invisível no topo, aparece após BG_START */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.statusBarBg,
                    {
                        height: insets.top,
                        opacity: bgOpacity,
                    },
                ]}
            >
                <StatusBar />
            </Animated.View>

            <Animated.View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top,
                        height: HEADER_HEIGHT + insets.top,
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
                {/* Camada de fundo do menu: transparente no topo, sólida após BG_START */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "#161718",
                            opacity: bgOpacity,
                            borderBottomWidth: 1,
                            borderBottomColor: headerBorder.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["transparent", "rgba(40, 40, 40, 0.1)"],
                            }),
                        },
                    ]}
                />

                <View style={styles.headerTop}>
                    <AvatarHeader />

                    <GroupSelectMenu
                        data={data}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        selectedGroupId={selectedGroupId}
                        setSelectedGroupId={setSelectedGroupId}
                        scrollRef={scrollRef}
                        setShowHeader={setShowHeader}
                    />

                    {selectedGroup && (
                        <GroupManager selectedGroupId={selectedGroupId ?? ""} />
                    )}
                </View>
            </Animated.View>
            <CreatePurchase
                selectedGroupId={selectedGroupId}
                floatbBtnTranslateY={floatbBtnTranslateY}
            />

            <Animated.ScrollView
                style={styles.container}
                ref={scrollRef}
                overScrollMode="never"
                contentContainerStyle={{
                    paddingBottom: 64,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: 8,
                    minHeight:
                        height - HEADER_HEIGHT - insets.top - insets.bottom,
                }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onLayout={(e) =>
                    setScrollViewHeight(e.nativeEvent.layout.height)
                }
                onContentSizeChange={(_, h) => setContentHeight(h)}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    {
                        useNativeDriver: true,
                        listener: (event: any) => {
                            const offsetY = event.nativeEvent.contentOffset.y;
                            const distanceFromBottom =
                                contentHeight - (offsetY + scrollViewHeight);
                            if (distanceFromBottom < 400) {
                                groupsRef.current?.loadMoreIfNeeded();
                            }
                        },
                    },
                )}
                onMomentumScrollBegin={() => {
                    if (menuOpen) {
                        closeMenu();
                    }
                }}
                onScrollBeginDrag={() => {
                    if (menuOpen) {
                        closeMenu();
                    }
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching || isFetchingGroupData > 0}
                        onRefresh={onRefresh}
                        progressViewOffset={
                            Platform.OS === "android"
                                ? HEADER_HEIGHT + insets.top
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
                <View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 0,
                        height: HEADER_MAX_HEIGHT,
                    }}
                >
                    <LinearGradient
                        colors={[GRADIENT_LEFT, GRADIENT_RIGHT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <LinearGradient
                        colors={[PAGE_BG_TRANSPARENT, PAGE_BG]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </View>
                <Groups
                    ref={groupsRef}
                    groupId={selectedGroupId}
                    updatedAt={updatedAt}
                />
                {groups.length === 0 && (
                    <View
                        style={{
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 16,
                        }}
                    >
                        <FromTheStart />
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: "#161718",
    },
    container: {
        flex: 1,
        backgroundColor: "#161718",
        gap: 8,
        flexDirection: "column",
    },
    title: {
        color: "#eeeeee",
        fontSize: 20,
    },

    // Fica por cima do header (zIndex maior) e fixa no topo da tela
    statusBarBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        zIndex: 101,
        elevation: 11,
    },

    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // elevation: 10,
    },
    headerTop: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerSlotLeft: {
        width: "33%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    headerCenter: {
        width: "33%",
        alignItems: "center",
        justifyContent: "center",
    },
    headerButton: {
        width: "100%",
        backgroundColor: "#2b2b2b",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
    },
    headerButtonActive: {
        borderColor: "#5E8C61",
        backgroundColor: "#303a32",
    },
    headerButtonTitle: {
        flexShrink: 1,
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    headerButtonIcon: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        transform: [{ rotate: "0deg" }],
    },
    headerButtonIconOpen: {
        transform: [{ rotate: "180deg" }],
    },
    popover: {
        backgroundColor: "#1f1f1f",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3a3a",
        overflow: "hidden",
        maxWidth: 220,
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    dropdownMenu: {
        width: 220,
        maxWidth: "80%",
        backgroundColor: "#1f1f1f",
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2d2d2d",
    },
    dropdownItemSelected: {
        backgroundColor: "#2d3a2f",
    },
    dropdownItemText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "500",
    },
    logo: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "700",
    },

    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
        width: "33%",
    },

    iconButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },

    icon: {
        color: "#fff",
        fontSize: 25,
    },

    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#6255b5",
        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        color: "#fff",
        fontWeight: "600",
    },

    categories: {
        paddingHorizontal: 24,
        gap: 10,
        alignItems: "center",
    },

    category: {
        height: 40,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "#202020",
        alignItems: "center",
        justifyContent: "center",
    },

    categoryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
        marginBottom: 16,
    },
});