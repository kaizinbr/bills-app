// lib/category-colors.ts

// Paleta pensada pra fundo escuro: tons médios-saturados que contrastam bem
// entre si sem competir (evita primárias puras tipo vermelho/lima lado a lado).
const PALETTE = [
    "#00C89B", // teal
    "#60A5FA", // azul
    "#9d4edd", // verde menta
    "#FBBF24", // âmbar
    "#C084FC", // violeta
    "#FB7185", // coral/rosa
    "#F97316", // laranja
    "#818CF8", // índigo
];

export function colorForIndex(index: number): string {
    return PALETTE[index % PALETTE.length];
}