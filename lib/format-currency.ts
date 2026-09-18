export function formatCurrency(
    value: number | string | null | undefined,
): string {
    const cents = Number(value ?? 0);
    if (Number.isNaN(cents)) return "R$ 0,00";

    return (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}