export function formatSectionDate(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Hoje";
    if (isSameDay(date, yesterday)) return "Ontem";

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
}