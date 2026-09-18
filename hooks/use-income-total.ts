import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

async function fetchIncomesFromInvoice(invoiceId: string): Promise<{
    total: number;
    incomes: {
        id: string;
        description: string;
        amount: number;
        createdById: string;
        createdAt: string;
        invoiceId: string;
    }[];
}> {
    const response = await api.get(`/invoices/${invoiceId}/incomes`);
    return response.data;
}

export function useIncomesFromInvoice(invoiceId: string | null) {
    return useQuery({
        queryKey: ["income", invoiceId, "total"],
        queryFn: () => fetchIncomesFromInvoice(invoiceId as string),
        enabled: !!invoiceId,
    });
}
