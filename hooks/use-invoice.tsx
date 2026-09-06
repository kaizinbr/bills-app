import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

type Invoice = {
    id: string;
    groupId: string;
    cardId: string | null;
    periodStart: string;
    closingDate: string;
    status: "OPEN" | "CLOSED" | "PAID";
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    purchases: {
        id: string;
        description: string;
        amount: number;
        purchasedAt: string;
        categoryId: string;
        invoiceId: string;
        cardId: string | null;
        subscriptionId: string | null;
        createdAt: string;
        updatedAt: string;
    }[];
};



async function fetchInvoices(invoiceId: string) {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data as { invoices: Invoice[] };
}

export function useInvoice(invoiceId: string) {
    return useQuery({
        queryKey: ["invoice", invoiceId],
        queryFn: () => fetchInvoices(invoiceId),
        enabled: !!invoiceId,
    });
}

async function fetchGroupTotal(groupId: string) {
    try {
        const response = await api.get(`/groups/${groupId}/total`);
        return response.data;
    } catch (error) {
        console.error("Error fetching group total:", error);
        throw error;
    }
}

export function useGroupTotal(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "total"],
        queryFn: () => fetchGroupTotal(groupId),
        enabled: !!groupId,
    });
}

async function fetchGroupPurchases(groupId: string) {
    try {
        const response = await api.get(`/groups/${groupId}/purchases`);
        return response.data;
    } catch (error) {
        console.error("Error fetching group purchases:", error);
        throw error;
    }
}

export function useGroupPurchases(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "purchases"],
        queryFn: () => fetchGroupPurchases(groupId),
        enabled: !!groupId,
    });
}
