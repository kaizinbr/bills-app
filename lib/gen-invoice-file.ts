import * as XLSX from "xlsx-js-style";
import { colorForCategoryKey } from "@/lib/category-colors";

// mistura a cor com branco (70%) para o texto escuro continuar legível
function clarear(hex: string): string {
    const n = parseInt(hex.replace("#", ""), 16);
    const mix = (c: number) =>
        Math.round(c + (255 - c) * 0.7)
            .toString(16)
            .padStart(2, "0");
    return (mix((n >> 16) & 255) + mix((n >> 8) & 255) + mix(n & 255)).toUpperCase();
}

export function genInvoiceFile(
    purchases: any[],
    formato: "csv" | "xlsx",
    titulo: string,
): string | Uint8Array {
    // 1. ordena da compra mais antiga para a mais nova
    const ordenadas = [...purchases].sort(
        (a, b) =>
            new Date(a.purchasedAt).getTime() -
            new Date(b.purchasedAt).getTime(),
    );

    // 2. uma linha por compra
    const linhas = ordenadas.map((p) => {
        const valor = p.amount / 100; // a API manda em centavos

        return [
            p.description.trim(),
            p.category?.label ?? "Sem categoria",
            p.installmentPlanId ? "Sim" : "Não",
            p.subscriptionId ? "Sim" : "Não",
            new Date(p.purchasedAt).toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
            }),
            // no CSV o valor vai como texto com vírgula, para o Excel em português entender
            formato === "csv" ? valor.toFixed(2).replace(".", ",") : valor,
        ];
    });

    // 3. linha 1 = título, linha 2 = cabeçalho, depois as compras e o total
    const primeiraLinha = 3;
    const ultimaLinha = linhas.length + 2;
    const linhaTotal = ultimaLinha + 1;

    const dados = [
        [titulo, "", "", "", "", ""],
        ["Descrição", "Categoria", "Parcelado", "Assinatura", "Data", "Valor"],
        ...linhas,
        ["", "", "", "", "Total", ""],
    ];

    const planilha = XLSX.utils.aoa_to_sheet(dados);

    // 4. CSV: o total entra como texto de fórmula e o Excel calcula ao abrir
    if (formato === "csv") {
        planilha[`F${linhaTotal}`] = {
            t: "s",
            v: `=SOMA(F${primeiraLinha}:F${ultimaLinha})`,
        };
        return "\uFEFF" + XLSX.utils.sheet_to_csv(planilha, { FS: ";" });
    }

    // 5. XLSX: fórmula de verdade, com valor já calculado para visualizadores simples
    const totalAtual = linhas.reduce((soma, l) => soma + (l[5] as number), 0);
    planilha[`F${linhaTotal}`] = {
        t: "n",
        f: `SUM(F${primeiraLinha}:F${ultimaLinha})`,
        v: totalAtual,
    };

    const colunas = ["A", "B", "C", "D", "E", "F"];

    // 6. título (linha 1): mesclado, verde do app, texto branco
    planilha["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    for (const col of colunas) {
        if (!planilha[`${col}1`]) planilha[`${col}1`] = { t: "s", v: "" };
        planilha[`${col}1`].s = {
            fill: { fgColor: { rgb: "009C7A" } },
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
        };
    }

    // 7. cabeçalho (linha 2): mesmo verde
    for (const col of colunas) {
        planilha[`${col}2`].s = {
            fill: { fgColor: { rgb: "009C7A" } },
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center" },
        };
    }

    // 8. compras: cor da categoria (clareada) em todas as colunas da linha
    ordenadas.forEach((p, i) => {
        const linha = primeiraLinha + i;
        const cor = clarear(colorForCategoryKey(p.category?.key ?? ""));

        for (const col of colunas) {
            planilha[`${col}${linha}`].s = {
                fill: { fgColor: { rgb: cor } },
                font: { color: { rgb: "1F1F1F" } },
                alignment: { horizontal: col === "F" ? "right" : "left" },
            };
        }
    });

    // 9. linha do total: verde do app
    for (const col of colunas) {
        if (!planilha[`${col}${linhaTotal}`]) {
            planilha[`${col}${linhaTotal}`] = { t: "s", v: "" };
        }
        planilha[`${col}${linhaTotal}`].s = {
            fill: { fgColor: { rgb: "009C7A" } },
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: col === "F" ? "right" : "left" },
        };
    }

    // 10. formato de moeda na coluna Valor (compras + total)
    for (let linha = primeiraLinha; linha <= linhaTotal; linha++) {
        planilha[`F${linha}`].z = '"R$" #,##0.00';
    }

    // largura das colunas e altura do título
    planilha["!cols"] = [
        { wch: 28 },
        { wch: 16 },
        { wch: 11 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
    ];
    planilha["!rows"] = [{ hpt: 28 }];

    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Fatura");
    const bytes = XLSX.write(livro, { type: "array", bookType: "xlsx" });
    return new Uint8Array(bytes);
}