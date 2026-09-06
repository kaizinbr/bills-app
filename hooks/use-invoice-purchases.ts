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
    pagination: { total: number; page: number; pageSize: number; hasNextPage: boolean };
};

async function fetchInvoicePurchases(invoiceId: string, page: number): Promise<PurchasesPage> {
    const response = await api.get(`/invoices/${invoiceId}/purchases`, { params: { page } });
    return response.data;
}

export function useInvoicePurchases(invoiceId: string | null) {
    return useInfiniteQuery({
        queryKey: ["invoice", invoiceId, "purchases"],
        queryFn: ({ pageParam }) => fetchInvoicePurchases(invoiceId as string, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
        enabled: !!invoiceId,
    });
}