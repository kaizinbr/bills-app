import type { Purchase } from "@/hooks/use-group-purchases";

export type PurchaseDateSection = {
    date: string; // yyyy-MM-dd, usado como key da seção
    purchases: Purchase[];
};

export function groupPurchasesByDate(purchases: Purchase[]): PurchaseDateSection[] {
    const map = new Map<string, Purchase[]>();

    for (const purchase of purchases) {
        const key = purchase.purchasedAt.slice(0, 10); // ignora hora
        const bucket = map.get(key);
        if (bucket) {
            bucket.push(purchase);
        } else {
            map.set(key, [purchase]);
        }
    }

    // Map preserva ordem de inserção — como `purchases` já vem
    // ordenado por data (API/paginação), isso é suficiente,
    // sem precisar reordenar aqui.
    return Array.from(map.entries()).map(([date, purchases]) => ({
        date,
        purchases,
    }));
}