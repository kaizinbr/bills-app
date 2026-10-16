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

export function colorForCategoryKey(categoryKey: string): string {
    let color = "#00C89B"; // default color

     switch (categoryKey) {
        case "lanche":
            color = "#FBBF24";
            break;
        case "mercado":
            color = "#FC592A";
            break;
        case "compras":
            color = "#30B7CB";
            break;
        case "restaurante":
            color = "#C084FC";
            break;
        case "farmacia":
            color = "#18C0B3";
            break;
        case "transporte":
            color = "#F97316";
            break;
        case "contas":
            color = "#AF69ED";
            break;
        case "parcela":
        case "netflix":
        case "hbo":
        case "prime-video":
        case "disney-plus":
        case "youtube-premium":
            color = "#9D4EDD";
            break;
        case "spotify":
        case "deezer":
        case "apple-music":
            color = "#00C89B";
            break;
        case "emprestimo":
            color = "#F97316";
            break;
        case "casa":
        case "aluguel":
            color = "#60A5FA";
            break;
    }
    
    return color;
}