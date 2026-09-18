import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Purchase = {
    id: string;
    description: string | null;
    amount: number;
    purchasedAt: string | null;
    invoiceId: string | null;
    cardId: string | null;
    userId: string | null;
    installmentPlanId: string | null;
    installmentNumber: number | null;
    subscriptionId: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
    category: {
        id: string;
        key: string;
        label: string;
        icon: string | null;
    } | null;
    subscription: {
        id: string;
        name: string;
        description: string | null;
    };
    installmentPlan: {
        id: string;
        description: string;
        totalAmount: number;
        installments: number;
        dayOfMonth: number;
    } | null;
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