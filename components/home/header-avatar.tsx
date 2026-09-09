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

export default function AvatarHeader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: profile, isLoading } = useProfile();
    const snapPoints = useMemo(() => ["80%", "100%"], []);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    return (
        <>
            <Pressable
                onPress={handlePresentModalPress}
                style={styles.headerSlotLeft}
            >
                <Avatar />
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
                        <AvatarNoPress size={64} fontSize={28} />
                        <TextDefault style={styles.nameText}>
                            {profile?.name}
                        </TextDefault>
                        <View style={styles.menu}>
                            <View style={styles.options}>
                                <TextDefault>Option 1</TextDefault>
                            </View>
                            <View style={styles.options}>
                                <TextDefault>Option 2</TextDefault>
                            </View>
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
});
