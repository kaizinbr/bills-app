import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

async function fetchInvoiceTotal(invoiceId: string): Promise<{ total: number }> {
    const response = await api.get(`/invoices/${invoiceId}/total`);
    return response.data;
}

export function useInvoiceTotal(invoiceId: string | null) {
    return useQuery({
        queryKey: ["invoice", invoiceId, "total"],
        queryFn: () => fetchInvoiceTotal(invoiceId as string),
        enabled: !!invoiceId,
    });
}