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

export type Period = {
    periodStart: string;
    closingDate: string;
};

type PurchasesPage = {
    purchases: Purchase[];
    period: Period;
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
    period?: Period,
): Promise<PurchasesPage> {
    const response = await api.get(`/groups/${groupId}/purchases`, {
        params: {
            page,
            ...(period && {
                periodStart: period.periodStart,
                closingDate: period.closingDate,
            }),
        },
    });
    return response.data;
}

// period undefined = fatura atual (padrão resolvido no servidor)
export function useGroupPurchases(groupId: string, period?: Period) {
    return useInfiniteQuery({
        queryKey: ["group", groupId, "purchases", period ?? "current"],
        queryFn: ({ pageParam }) =>
            fetchGroupPurchases(groupId, pageParam, period),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.pagination.hasNextPage
                ? lastPage.pagination.page + 1
                : undefined,
        enabled: !!groupId,
    });
}