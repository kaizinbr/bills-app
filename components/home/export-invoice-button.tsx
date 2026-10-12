import { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";

import TextDefault from "@/components/core/text-core";
import {
    exportInvoice,
    type ExportFormat,
    type ExportPurchase,
} from "@/lib/export-invoice";

export default function ExportInvoiceButton({
    purchases,
    fileName,
}: {
    purchases: ExportPurchase[];
    fileName: string;
}) {
    const [loading, setLoading] = useState(false);

    const handleExport = async (format: ExportFormat) => {
        try {
            setLoading(true);
            await exportInvoice({ purchases, fileName, format });
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
        if (purchases.length === 0) {
            Alert.alert("Nada para exportar", "Essa conta ainda não tem gastos.");
            return;
        }

        Alert.alert("Exportar conta", "Escolha o formato do arquivo", [
            { text: "CSV", onPress: () => handleExport("csv") },
            { text: "Excel (.xlsx)", onPress: () => handleExport("xlsx") },
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
                {loading ? "Gerando..." : "Exportar planilha"}
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