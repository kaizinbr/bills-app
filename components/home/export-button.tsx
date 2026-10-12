import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";

import TextDefault from "@/components/core/text-core";
import {
    exportGroup,
    type ExportFormat,
    type ExportScope,
    type GroupExportData,
} from "@/lib/export-group";

export default function ExportButton({
    scope,
    loadData,
    label = "Exportar planilha",
}: {
    scope: ExportScope;
    loadData: () => Promise<GroupExportData>;
    label?: string;
}) {
    const [loading, setLoading] = useState(false);

    const handleExport = async (format: ExportFormat) => {
        try {
            setLoading(true);
            const data = await loadData();

            if (data.purchases.length === 0) {
                Alert.alert("Nada para exportar", "Ainda não há gastos registrados.");
                return;
            }

            await exportGroup({ data, scope, format });
        } catch (error) {
            Alert.alert(
                "Erro ao exportar",
                error instanceof Error
                    ? error.message
                    : "Não foi possível gerar a planilha.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePress = () => {
        const xlsxHint =
            scope.kind === "group"
                ? "Excel (.xlsx) traz tudo em abas. CSV traz só a lista de compras."
                : "Excel (.xlsx) traz resumo, compras e entradas da fatura. CSV traz só as compras.";

        Alert.alert("Exportar", xlsxHint, [
            { text: "Excel (.xlsx)", onPress: () => handleExport("xlsx") },
            { text: "CSV", onPress: () => handleExport("csv") },
            { text: "Cancelar", style: "cancel" },
        ]);
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={loading}
            style={({ pressed }) => [
                styles.button,
                { opacity: loading ? 0.5 : 1 },
                pressed && styles.pressed,
            ]}
        >
            <TextDefault style={styles.text}>
                {loading ? "Gerando..." : label}
            </TextDefault>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: "#00C89B",
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        backgroundColor: "#007B5E",
    },
    text: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});