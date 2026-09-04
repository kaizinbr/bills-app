// hooks/use-group-purchases.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type Purchase = {
    id: string;
    description: string;
    amount: number;
    createdAt: string;
    purchasedAt: string;
    groupId: string;
};

type PurchasesResponse = {
    purchases: Purchase[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

async function fetchGroupPurchases({ groupId, page }: { groupId: string; page: number }): Promise<PurchasesResponse> {
    const response = await api.get(`/groups/${groupId}/purchases`, { params: { page } });
    return response.data;
}

export function useGroupPurchases(groupId: string) {
    return useInfiniteQuery({
        queryKey: ['group', groupId, 'purchases'],
        queryFn: ({ pageParam }) => fetchGroupPurchases({ groupId, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
        enabled: !!groupId,
    });
}