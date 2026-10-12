import * as XLSX from "xlsx";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export type ExportPurchase = {
    id: string;
    description: string;
    amount: number;
    date: string;
    category?: string | null;
};

export type ExportFormat = "csv" | "xlsx";

type ExportInvoiceParams = {
    purchases: ExportPurchase[];
    fileName: string;
    format: ExportFormat;
};

const HEADERS = ["Data", "Descrição", "Categoria", "Valor"];

const MIME_TYPES: Record<ExportFormat, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const UTIS: Record<ExportFormat, string> = {
    csv: "public.comma-separated-values-text",
    xlsx: "org.openxmlformats.spreadsheetml.sheet",
};

function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
}

function toRows(purchases: ExportPurchase[]): (string | number)[][] {
    return purchases.map((purchase) => [
        formatDate(purchase.date),
        purchase.description,
        purchase.category ?? "",
        purchase.amount,
    ]);
}

function csvEscape(value: string | number): string {
    const text =
        typeof value === "number" ? value.toFixed(2).replace(".", ",") : value;

    if (/[";\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function buildCsv(purchases: ExportPurchase[]): string {
    const lines = [HEADERS, ...toRows(purchases)].map((row) =>
        row.map(csvEscape).join(";"),
    );
    // BOM para o Excel reconhecer UTF-8 (acentos)
    return "\uFEFF" + lines.join("\r\n");
}

function sanitizeSheetName(name: string): string {
    const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim();
    return (cleaned || "Conta").slice(0, 31);
}

function buildXlsx(purchases: ExportPurchase[], sheetName: string): Uint8Array {
    const rows = toRows(purchases);
    const total = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    const worksheet = XLSX.utils.aoa_to_sheet([
        HEADERS,
        ...rows,
        [],
        ["", "", "Total", total],
    ]);

    worksheet["!cols"] = [{ wch: 12 }, { wch: 36 }, { wch: 18 }, { wch: 14 }];

    const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
    for (let row = 1; row <= range.e.r; row++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
        if (cell && cell.t === "n") {
            cell.z = '"R$" #,##0.00';
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sanitizeSheetName(sheetName),
    );

    const output = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    return new Uint8Array(output);
}

function sanitizeFileName(name: string): string {
    const cleaned = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    return cleaned || "conta";
}

export async function exportInvoice({
    purchases,
    fileName,
    format,
}: ExportInvoiceParams): Promise<void> {
    const safeName = sanitizeFileName(fileName);

    const file = new File(Paths.cache, `${safeName}.${format}`);
    if (file.exists) {
        file.delete();
    }
    file.create();

    if (format === "csv") {
        file.write(buildCsv(purchases));
    } else {
        file.write(buildXlsx(purchases, fileName));
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
        throw new Error("Compartilhamento indisponível neste dispositivo.");
    }

    await Sharing.shareAsync(file.uri, {
        mimeType: MIME_TYPES[format],
        UTI: UTIS[format],
        dialogTitle: "Exportar conta",
    });
}