import * as XLSX from "xlsx";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export type ExportFormat = "csv" | "xlsx";

export type ExportMember = {
    id: string;
    name: string;
};

export type ExportInvoice = {
    id: string;
    referenceMonth: number;
    referenceYear: number;
    closingDate: string;
    status: string;
};

export type ExportPurchase = {
    id: string;
    invoiceId: string;
    userId: string | null;
    category: string;
    description: string | null;
    amount: number; // centavos
    date: string;
    installmentPlanId: string | null;
    installmentNumber: number | null;
    subscriptionId?: string | null;
};

export type ExportSubscription = {
    id: string;
    userId: string | null;
    category: string;
    description: string | null;
    amount: number; // centavos
    dayOfMonth: number | null;
    startDate: string;
    cancelledAt: string | null;
};

export type ExportInstallmentPlan = {
    id: string;
    userId: string | null;
    category: string;
    description: string | null;
    totalAmount: number; // centavos
    installments: number;
    dayOfMonth: number | null;
    startDate: string;
    cancelledAt: string | null;
};

export type ExportIncomeEntry = {
    id: string;
    invoiceId: string;
    description: string | null;
    amount: number; // centavos
    date: string;
};

export type GroupExportData = {
    groupName: string;
    members: ExportMember[];
    invoices: ExportInvoice[];
    purchases: ExportPurchase[];
    subscriptions: ExportSubscription[];
    installmentPlans: ExportInstallmentPlan[];
    incomeEntries: ExportIncomeEntry[];
};

export type ExportScope =
    | { kind: "group" }
    | { kind: "invoice"; invoiceId: string };

type Cell = string | number;

type Table = {
    name: string;
    headers: string[];
    rows: Cell[][];
    moneyCols: number[];
    widths: number[];
    footer?: Cell[];
};

const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

const MIME_TYPES: Record<ExportFormat, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const UTIS: Record<ExportFormat, string> = {
    csv: "public.comma-separated-values-text",
    xlsx: "org.openxmlformats.spreadsheetml.sheet",
};

const SHARED_LABEL = "Dividida";

function formatDate(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR");
}

function toReais(cents: number): number {
    return cents / 100;
}

function invoiceLabel(invoice: ExportInvoice): string {
    const month = MONTHS[invoice.referenceMonth - 1] ?? String(invoice.referenceMonth);
    return `${month}/${invoice.referenceYear}`;
}

function sortInvoices(invoices: ExportInvoice[]): ExportInvoice[] {
    return [...invoices].sort(
        (a, b) =>
            a.referenceYear - b.referenceYear ||
            a.referenceMonth - b.referenceMonth,
    );
}

function sumCents(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0);
}

function buildTables(data: GroupExportData, scope: ExportScope): Table[] {
    const memberNames = new Map(data.members.map((m) => [m.id, m.name]));
    const ownerName = (userId: string | null): string =>
        userId ? (memberNames.get(userId) ?? "Removido") : SHARED_LABEL;

    const allInvoices = sortInvoices(data.invoices);
    const invoices =
        scope.kind === "invoice"
            ? allInvoices.filter((inv) => inv.id === scope.invoiceId)
            : allInvoices;
    const invoiceIds = new Set(invoices.map((inv) => inv.id));
    const invoiceById = new Map(allInvoices.map((inv) => [inv.id, inv]));
    const planById = new Map(data.installmentPlans.map((p) => [p.id, p]));

    const purchases = data.purchases
        .filter((p) => invoiceIds.has(p.invoiceId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const incomes = data.incomeEntries
        .filter((i) => invoiceIds.has(i.invoiceId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Resumo
    const resumoRows: Cell[][] = invoices.map((invoice) => {
        const spent = sumCents(
            purchases.filter((p) => p.invoiceId === invoice.id).map((p) => p.amount),
        );
        const received = sumCents(
            incomes.filter((i) => i.invoiceId === invoice.id).map((i) => i.amount),
        );
        return [
            invoiceLabel(invoice),
            formatDate(invoice.closingDate),
            invoice.status === "OPEN" ? "Aberta" : "Fechada",
            toReais(spent),
            toReais(received),
            toReais(received - spent),
        ];
    });

    const totalSpent = sumCents(purchases.map((p) => p.amount));
    const totalReceived = sumCents(incomes.map((i) => i.amount));

    const resumo: Table = {
        name: "Resumo",
        headers: ["Fatura", "Fechamento", "Status", "Gastos", "Entradas", "Saldo"],
        rows: resumoRows,
        moneyCols: [3, 4, 5],
        widths: [16, 14, 12, 14, 14, 14],
        footer: [
            "Total",
            "",
            "",
            toReais(totalSpent),
            toReais(totalReceived),
            toReais(totalReceived - totalSpent),
        ],
    };

    // Compras
    const comprasRows: Cell[][] = purchases.map((purchase) => {
        const invoice = invoiceById.get(purchase.invoiceId);
        const plan = purchase.installmentPlanId
            ? planById.get(purchase.installmentPlanId)
            : undefined;

        let kind = "Compra";
        if (purchase.installmentPlanId && purchase.installmentNumber) {
            kind = plan
                ? `Parcela ${purchase.installmentNumber}/${plan.installments}`
                : `Parcela ${purchase.installmentNumber}`;
        } else if (purchase.subscriptionId) {
            kind = "Assinatura";
        }

        return [
            invoice ? invoiceLabel(invoice) : "",
            formatDate(purchase.date),
            purchase.category,
            purchase.description ?? "",
            ownerName(purchase.userId),
            kind,
            toReais(purchase.amount),
        ];
    });

    const compras: Table = {
        name: "Compras",
        headers: [
            "Fatura",
            "Data",
            "Categoria",
            "Descrição",
            "Responsável",
            "Tipo",
            "Valor",
        ],
        rows: comprasRows,
        moneyCols: [6],
        widths: [16, 12, 18, 32, 16, 16, 14],
        footer: ["", "", "", "", "", "Total", toReais(totalSpent)],
    };

    // Entradas
    const entradas: Table = {
        name: "Entradas",
        headers: ["Fatura", "Data", "Descrição", "Valor"],
        rows: incomes.map((income) => {
            const invoice = invoiceById.get(income.invoiceId);
            return [
                invoice ? invoiceLabel(invoice) : "",
                formatDate(income.date),
                income.description ?? "",
                toReais(income.amount),
            ];
        }),
        moneyCols: [3],
        widths: [16, 12, 32, 14],
        footer: ["", "", "Total", toReais(totalReceived)],
    };

    if (scope.kind === "invoice") {
        return [resumo, compras, entradas];
    }

    // Assinaturas
    const assinaturas: Table = {
        name: "Assinaturas",
        headers: [
            "Categoria",
            "Descrição",
            "Responsável",
            "Valor mensal",
            "Dia da cobrança",
            "Início",
            "Status",
            "Cancelada em",
        ],
        rows: data.subscriptions.map((sub) => [
            sub.category,
            sub.description ?? "",
            ownerName(sub.userId),
            toReais(sub.amount),
            sub.dayOfMonth ?? "",
            formatDate(sub.startDate),
            sub.cancelledAt ? "Cancelada" : "Ativa",
            formatDate(sub.cancelledAt),
        ]),
        moneyCols: [3],
        widths: [18, 28, 16, 14, 16, 12, 12, 14],
    };

    // Parcelamentos
    const parcelamentos: Table = {
        name: "Parcelamentos",
        headers: [
            "Categoria",
            "Descrição",
            "Responsável",
            "Valor total",
            "Parcelas",
            "Dia da cobrança",
            "Início",
            "Status",
            "Cancelado em",
        ],
        rows: data.installmentPlans.map((plan) => [
            plan.category,
            plan.description ?? "",
            ownerName(plan.userId),
            toReais(plan.totalAmount),
            plan.installments,
            plan.dayOfMonth ?? "",
            formatDate(plan.startDate),
            plan.cancelledAt ? "Cancelado" : "Ativo",
            formatDate(plan.cancelledAt),
        ]),
        moneyCols: [3],
        widths: [18, 28, 16, 14, 10, 16, 12, 12, 14],
    };

    return [resumo, compras, assinaturas, parcelamentos, entradas];
}

function csvEscape(value: Cell, isMoney: boolean): string {
    let text: string;
    if (typeof value === "number") {
        text = isMoney ? value.toFixed(2).replace(".", ",") : String(value);
    } else {
        text = value;
    }

    if (/[";\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function buildCsv(table: Table): string {
    const lines = [table.headers, ...table.rows].map((row, rowIndex) =>
        row
            .map((cell, colIndex) =>
                csvEscape(cell, rowIndex > 0 && table.moneyCols.includes(colIndex)),
            )
            .join(";"),
    );
    // BOM para o Excel reconhecer UTF-8 (acentos)
    return "\uFEFF" + lines.join("\r\n");
}

function buildXlsx(tables: Table[]): Uint8Array {
    const workbook = XLSX.utils.book_new();

    for (const table of tables) {
        const aoa: Cell[][] = [table.headers, ...table.rows];
        if (table.footer) {
            aoa.push([], table.footer);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        worksheet["!cols"] = table.widths.map((wch) => ({ wch }));

        const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
        for (let row = 1; row <= range.e.r; row++) {
            for (const col of table.moneyCols) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell && cell.t === "n") {
                    cell.z = '"R$" #,##0.00';
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, table.name);
    }

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

function buildFileName(data: GroupExportData, scope: ExportScope): string {
    if (scope.kind === "group") {
        return `${sanitizeFileName(data.groupName)}-completo`;
    }
    const invoice = data.invoices.find((inv) => inv.id === scope.invoiceId);
    const suffix = invoice
        ? sanitizeFileName(invoiceLabel(invoice))
        : "fatura";
    return `${sanitizeFileName(data.groupName)}-fatura-${suffix}`;
}

export async function exportGroup({
    data,
    scope,
    format,
}: {
    data: GroupExportData;
    scope: ExportScope;
    format: ExportFormat;
}): Promise<void> {
    const tables = buildTables(data, scope);
    const comprasTable = tables.find((t) => t.name === "Compras") as Table;

    const file = new File(Paths.cache, `${buildFileName(data, scope)}.${format}`);
    if (file.exists) {
        file.delete();
    }
    file.create();

    if (format === "csv") {
        file.write(buildCsv(comprasTable));
    } else {
        file.write(buildXlsx(tables));
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