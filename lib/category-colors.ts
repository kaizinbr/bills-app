// lib/category-colors.ts
const PALETTE = [
    "#1DB954", // verde (marca)
    "#3B82F6", // azul
    "#F59E0B", // âmbar
    "#A855F7", // roxo
    "#EF4444", // vermelho
    "#06B6D4", // ciano
    "#EC4899", // rosa
    "#84CC16", // lima
];

export function colorForIndex(index: number): string {
    return PALETTE[index % PALETTE.length];
}