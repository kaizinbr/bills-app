export function formatCurrency(value: number | string | null | undefined): string {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "R$0,00";
    return `R$${numeric.toFixed(2).replace(".", ",")}`;
}