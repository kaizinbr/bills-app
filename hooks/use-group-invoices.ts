import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type Invoice = {
    id: string;
    cardId: string | null;
    card: { id: string; name: string; color: string } | null;
    periodStart: string;
    closingDate: string;
    status: "OPEN" | "CLOSED" | "PAID";
};

async function fetchGroupInvoices(groupId: string) {
    const response = await api.get(`/groups/${groupId}/invoices`);
    return response.data as { invoices: Invoice[] };
}

export function useGroupInvoices(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "invoices"],
        queryFn: () => fetchGroupInvoices(groupId),
        enabled: !!groupId,
    });
}