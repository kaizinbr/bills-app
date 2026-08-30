import { forwardRef, useImperativeHandle, useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import TextDefault from "@/components/core/text-core";
import { useGroups } from "@/hooks/use-group";
import { useGroupPurchases } from "@/hooks/use-group-purchases";
import { useGroupTotal } from "@/hooks/use-group-total";
import { formatCurrency } from "@/lib/format-currency";

import { CardIcon } from '@solar-icons/react-native/linear/card'
import { WalletIcon } from '@solar-icons/react-native/linear/wallet'
import { BagCheckIcon } from '@solar-icons/react-native/linear/bag-check'
import { Bag3Icon } from '@solar-icons/react-native/linear/bag-3'
import { UserCircleIcon } from '@solar-icons/react-native/linear/user-circle'

type GroupsProps = {
    groupId: string | null;
};

export type GroupsHandle = {
    loadMoreIfNeeded: () => void;
};

const Groups = forwardRef<GroupsHandle, GroupsProps>(({ groupId }, ref) => {
    const router = useRouter();
    const { data } = useGroups();

    const group = useMemo(() => {
        if (!data || !groupId) return null;
        return (
            [...data.creditorGroups, ...data.debtorGroups].find(
                (g) => g.id === groupId,
            ) ?? null
        );
    }, [data, groupId]);

    const { data: totalData } = useGroupTotal(groupId ?? "");

    const {
        data: purchasesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: purchasesLoading,
    } = useGroupPurchases(groupId ?? "");

    const purchases = useMemo(
        () => purchasesData?.pages.flatMap((page) => page.purchases) ?? [],
        [purchasesData],
    );

    const totalPurchases = purchasesData?.pages[0]?.pagination.total ?? 0;

    useImperativeHandle(ref, () => ({
        loadMoreIfNeeded: () => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        },
    }));

    if (!group) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#1DB954", "#0B3D22"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.groupCard}
            >
                <TextDefault style={styles.groupName}>{group.name}</TextDefault>
                <TextDefault
                    style={[
                        styles.groupValue,
                        { fontFamily: "Jersey25_400Regular" },
                    ]}
                >
                    {formatCurrency(totalData?.total)}
                </TextDefault>
                <TextDefault style={styles.groupClosing}>
                    Fecha dia {group.closingDay}
                </TextDefault>
            </LinearGradient>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.infoRow}
            >
                <View style={styles.infoChip}>
                    <UserCircleIcon size={24} color="white" />
                    <TextDefault>Pagar a: {group.debtor?.name}</TextDefault>
                </View>
                <View style={styles.infoChip}>
                    <Bag3Icon size={24} color="white" />
                    <TextDefault>{totalPurchases} compras</TextDefault>
                </View>

                {group.cards?.map((card) => (
                    <View
                        key={card.id}
                        style={[
                            styles.infoChip,
                            {
                                backgroundColor: card.color || "#282828",
                            },
                        ]}
                    >
                        <CardIcon size={24} color="white" />
                        <TextDefault>{card.name}</TextDefault>
                    </View>
                ))}

                <Pressable
                    onPress={() =>
                        router.push({
                            pathname: "/create-card/[groupId]",
                            params: { groupId: group.id },
                        })
                    }
                    style={styles.infoChip}
                >
                    <WalletIcon size={24} color="white" />
                    <TextDefault>Criar cartão</TextDefault>
                </Pressable>

                <Pressable
                    onPress={() =>
                        router.push({
                            pathname: "/create-purchase/[groupId]",
                            params: { groupId: group.id },
                        })
                    }
                    style={styles.infoChip}
                >
                    <BagCheckIcon  size={24} color="white" />
                    <TextDefault>Criar compra</TextDefault>
                </Pressable>
            </ScrollView>

            <View style={styles.purchasesList}>
                {purchasesLoading ? (
                    <ActivityIndicator
                        size="small"
                        color="#B3B3B3"
                        style={{ marginTop: 12 }}
                    />
                ) : (
                    purchases.map((purchase) => (
                        <View key={purchase.id} style={styles.purchaseItem}>
                            <TextDefault style={styles.purchaseDescription}>
                                {purchase.description || "Sem descrição"}
                            </TextDefault>
                            <TextDefault
                                style={[
                                    styles.purchaseAmount,
                                    { fontFamily: "Jersey25_400Regular" },
                                ]}
                            >
                                {formatCurrency(purchase.amount)}
                            </TextDefault>
                        </View>
                    ))
                )}

                {isFetchingNextPage && (
                    <ActivityIndicator
                        size="small"
                        color="#B3B3B3"
                        style={{ marginVertical: 16 }}
                    />
                )}
            </View>
        </View>
    );
});

export default Groups;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 16,
    },
    groupCard: {
        padding: 16,
        borderRadius: 16,
        width: "100%",
        aspectRatio: 5 / 3,
        justifyContent: "flex-end",
    },
    groupName: {
        fontSize: 14,
        color: "#fff",
    },
    groupValue: {
        fontSize: 32,
        color: "#fff",
        // fontFamily: "Jersey25_400Regular",
        fontWeight: "800",
    },
    groupClosing: {
        fontSize: 14,
        color: "#eaeaea",
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
    },
    infoChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#282828",
        borderRadius: 8,
        aspectRatio: 5/3,
    },
    purchasesList: {
        width: "100%",
    },
    purchaseItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#232323",
    },
    purchaseDescription: {
        fontSize: 14,
        color: "#eee",
    },
    purchaseAmount: {
        fontSize: 14,
        color: "#fff",
    },
});
