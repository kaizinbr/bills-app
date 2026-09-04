import { useRouter } from "expo-router";
import {
    Animated,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useGroups } from "@/hooks/use-group";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddIcon } from "@solar-icons/react-native/linear/add";

export default function CreatePurchase({
    selectedGroupId,
    floatbBtnTranslateY,
}: {
    selectedGroupId: string | null;
    floatbBtnTranslateY: any;
}) {
    const router = useRouter();

    const insets = useSafeAreaInsets();

    const { data } = useGroups();

    const group = useMemo(() => {
        if (!data || !selectedGroupId) return null;
        return (
            [...data.creditorGroups, ...data.debtorGroups].find(
                (g) => g.id === selectedGroupId,
            ) ?? null
        );
    }, [data, selectedGroupId]);

    if (!group) return null;

    return (
        <Animated.View
            style={{
                transform: [{ translateY: floatbBtnTranslateY }],
                position: "absolute",
                bottom: insets.bottom,
                right: 16,
                zIndex: 1000,
            }}
        >
            <Pressable
                onPress={() =>
                    // router.push({
                    //     pathname: "/create-purchase/[groupId]",
                    //     params: { groupId: group.id, purchaseId: null },

                    // })
                    router.push(
                        `/purchase-edit?groupId=${group.id}&purchaseId=null`,
                    )
                }
                style={styles.container}
            >
                <AddIcon size={24} color="#ffffff" strokeWidth={3} />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2d2d2d",
        padding: 12,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1000,
    },
});
