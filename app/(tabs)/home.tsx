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
    useWindowDimensions,
    View,
} from "react-native";
import TextDefault from "@/components/core/text-core";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import StatusBar from "@/components/core/status-bar";
import Groups from "@/components/home/groups";
import { useGroups } from "@/hooks/use-group";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import type { GroupsHandle } from "@/components/home/groups";
import {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

import PopoverMenu from "@/components/home/popover-btn";
import ScrollToTopBtn from "@/components/home/scroll-top-btn";
import CreatePurchase from "@/components/home/float-btn";
import FromTheStart from "@/components/home/start";

const HEADER_HEIGHT = 64;

export default function Home() {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const { data, refetch, isFetching } = useGroups();
    // const {}
    const [showHeader, setShowHeader] = useState(false);

    const groupsRef = useRef<GroupsHandle>(null);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const { height } = useWindowDimensions();
    const HEADER_MAX_HEIGHT = height * 0.4;

    const scrollOffsetY = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const handleScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollOffsetY.value = event.contentOffset.y;
        },
    });

    const statusBarOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            scrollOffsetY.value,
            [100, 160],
            [0, 1],
            Extrapolation.CLAMP,
        ),
    }));

    const scrollRef = useRef<ScrollView>(null);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

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

    useEffect(() => {
        if (!selectedGroupId && allGroups.length > 0) {
            setSelectedGroupId(allGroups[0].id);
        }
    }, [allGroups, selectedGroupId]);

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
    }, [refetch]);

    return (
        <View style={styles.box}>
            <StatusBar />
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
                <View style={styles.headerTop}>
                    <View style={styles.headerSlotLeft}>
                        <Avatar />
                    </View>

                    <PopoverMenu
                        data={data}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        selectedGroupId={selectedGroupId}
                        setSelectedGroupId={setSelectedGroupId}
                        scrollRef={scrollRef}
                        setShowHeader={setShowHeader}
                    />

                    <View style={styles.headerActions}>
                        <Pressable style={styles.iconButton}>
                            <TextDefault style={styles.icon}>♧</TextDefault>
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
            {/* <ScrollToTopBtn scrollRef={scrollRef} scrollY={scrollY} /> */}
            <CreatePurchase
                selectedGroupId={selectedGroupId}
                floatbBtnTranslateY={floatbBtnTranslateY}
            />
            <Animated.ScrollView
                style={styles.container}
                ref={scrollRef}
                contentContainerStyle={{
                    paddingTop: HEADER_HEIGHT,
                    paddingBottom: 64,
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: 8,
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
                <Groups ref={groupsRef} groupId={selectedGroupId} />
                {allGroups.length === 0 && (
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
        // padding: 16,
        paddingTop: 64,
        flexDirection: "column",
    },
    title: {
        color: "#eeeeee",
        fontSize: 20,
    },

    statusBarBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        zIndex: 0,
    },

    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 10,
        backgroundColor: "#161718",
        borderBottomWidth: 0.5,
        borderBottomColor: "#282828",
    },
    headerTop: {
        paddingHorizontal: 16,
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
        borderColor: "#3a3a3a",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
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
        // backgroundColor: "red",
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
        paddingHorizontal: 16,
        gap: 10,
        alignItems: "center",
    },

    category: {
        height: 40,
        paddingHorizontal: 16,
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
