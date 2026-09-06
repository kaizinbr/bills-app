import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Purchase = {
    id: string;
    description: string | null;
    amount: number;
    purchasedAt: string;
    cardId: string | null;
    invoiceId: string;
    category: { id: string; key: string; label: string; icon: string | null };
};

type PurchasesPage = {
    purchases: Purchase[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        hasNextPage: boolean;
    };
};

async function fetchGroupPurchases(
    groupId: string,
    page: number,
): Promise<PurchasesPage> {
    const response = await api.get(`/groups/${groupId}/purchases`, {
        params: { page },
    });
    return response.data;
}

export function useGroupPurchases(groupId: string) {
    return useInfiniteQuery({
        queryKey: ["group", groupId, "purchases"],
        queryFn: ({ pageParam }) => fetchGroupPurchases(groupId, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.pagination.hasNextPage
                ? lastPage.pagination.page + 1
                : undefined,
        enabled: !!groupId,
    });
}
