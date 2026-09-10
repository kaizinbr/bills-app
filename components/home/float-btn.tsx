import { useGroupInvoices, type Invoice } from "@/hooks/use-group-invoices";
import { AddIcon } from "@solar-icons/react-native/linear/add";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreatePurchase({
    selectedGroupId,
    floatbBtnTranslateY,
}: {
    selectedGroupId: string | null;
    floatbBtnTranslateY: any;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: invoicesData } = useGroupInvoices(selectedGroupId ?? "");

    const currentInvoice = useMemo(
        () =>
            invoicesData?.invoices.find(
                (inv: Invoice) => inv.status === "OPEN",
            ) ?? null,
        [invoicesData],
    );

    const floatButtonScale = floatbBtnTranslateY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.2],
        extrapolate: "clamp",
    });

    if (!selectedGroupId || !currentInvoice) return null;

    return (
        <Animated.View
            style={{
                transform: [
                    { translateY: floatbBtnTranslateY },
                    { scaleX: floatButtonScale },
                    { scaleY: floatButtonScale },
                ],
                position: "absolute",
                bottom: insets.bottom,
                right: 16,
                zIndex: 1000,
            }}
        >
            <Pressable
                onPress={() =>
                    router.push(
                        `/purchase-edit?groupId=${selectedGroupId}&invoiceId=${currentInvoice.id}&purchaseId=null`,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1000,
    },
});
