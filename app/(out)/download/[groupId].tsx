import api from "@/lib/api";
import { useEffect, useState, useMemo } from "react";

import { Host, ToggleButton, Text } from "@expo/ui/jetpack-compose";

import { useAuth } from "@/components/core/auth-provider";

import StatusBar from "@/components/core/status-bar";
import TextDefault from "@/components/core/text-core";
import * as Clipboard from "expo-clipboard";

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackBtn from "@/components/core/back-btn";
import { useCreateGroup } from "@/hooks/use-create-group";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DateType, useDefaultStyles } from "react-native-ui-datepicker";

import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useGroupInvoices } from "@/hooks/use-group-invoices";
import { sortInvoicesDesc } from "@/components/home/groups";
import ExportInvoiceSelector from "@/components/download/invoice-selector";

import { genInvoiceFile } from "@/lib/gen-invoice-file";

export default function CreateGroup() {
    const router = useRouter();

    const local = useLocalSearchParams();
    const id = local.groupId as string; // id da conta
    const invoiceId = local.invoiceId as string; // id da fatura
    console.log("groupId:", id, "invoiceId:", invoiceId);

    const { data: invoicesData } = useGroupInvoices(id);
    const invoices = useMemo(
        () => sortInvoicesDesc(invoicesData?.invoices ?? []),
        [invoicesData],
    );

    const currentInvoice = useMemo(
        () =>
            invoices.find((inv) => inv.status === "OPEN") ??
            invoices[0] ??
            null,
        [invoices],
    );

    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
        invoiceId,
    );

    const selectedInvoice = useMemo(() => {
        // purchasesRefetch();
        if (selectedInvoiceId) {
            return (
                invoices.find((inv) => inv.id === selectedInvoiceId) ??
                currentInvoice
            );
        }
        setSelectedInvoiceId(currentInvoice?.id ?? null);

        return currentInvoice;
    }, [invoices, selectedInvoiceId, currentInvoice]);

    const { mutate: createGroup, isPending, isError, error } = useCreateGroup();

    const { session } = useAuth();
    const currentUserId = session?.user?.id;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);

    let today = new Date();
    const defaultStyles = useDefaultStyles();
    const [selected, setSelected] = useState<DateType>();

    const [checked, setChecked] = useState(false);

    const [groupName, setGroupName] = useState("");
    const [groupData, setGroupData] = useState<any>(null);

    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [invoicePurchases, setInvoicePurchases] = useState<any[]>([]);
    const [invoiceTotal, setInvoiceTotal] = useState(0);

    const [type, setType] = useState<"csv" | "xlsx">("xlsx");

    const [inviteCode, setInviteCode] = useState("");
    const [amountCents, setAmountCents] = useState("");
    const [iPay, setIPay] = useState(true);
    const [iReceive, setIReceive] = useState(false);
    const [groupPayer, setGroupPayer] = useState("");
    const [groupReceiver, setGroupReceiver] = useState("");
    const [groupClosingDate, setGroupClosingDate] = useState<DateType>(
        new Date(),
    );
    const [groupArchived, setGroupArchived] = useState(false);
    const [groupCards, setGroupCards] = useState("");

    const [users, setUsers] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);

    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        const isValid = groupName.trim() !== "" && amountCents.trim() !== "";
        setCanSubmit(isValid);
    }, [groupName, amountCents, groupClosingDate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/groups/${id}`);
                setGroupData(response.data.group);
                const group = response.data.group;
                // console.log("Fetched group data:", group);

                setGroupName(group.name);
                setInviteCode(group.inviteCode);

                const invoiceResponse = await api.get(`/invoices/${invoiceId}`);
                setInvoiceData(invoiceResponse.data.invoice);
                // console.log("Fetched invoice data:", invoiceResponse.data.invoice);
                const invoiccTotalResponse = await api.get(
                    `/invoices/${invoiceId}/total`,
                );
                setInvoiceTotal(invoiccTotalResponse.data.total);
                const invoicePurchasesResponse = await api.get(
                    `/invoices/${invoiceId}/purchases`,
                );
                setInvoicePurchases(invoicePurchasesResponse.data.purchases);
                // console.log("Fetched invoice total:", invoiccTotalResponse.data.total);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching group data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                console.log("Fetching invoice data for invoiceId:", invoiceId);
                const invoiceResponse = await api.get(`/invoices/${invoiceId}`);
                setInvoiceData(invoiceResponse.data.invoice);
                // console.log("Fetched invoice data:", invoiceResponse.data.invoice);
                const invoiccTotalResponse = await api.get(
                    `/invoices/${invoiceId}/total`,
                );
                setInvoiceTotal(invoiccTotalResponse.data.total);

                const invoicePurchasesResponse = await api.get(
                    `/invoices/${invoiceId}/purchases?pageSize=all`,
                );
                setInvoicePurchases(invoicePurchasesResponse.data.purchases);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching invoice data:", error);
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [invoiceId, selectedInvoiceId]);

    const handleExport = async (
        formato: "csv" | "xlsx",
        acao: "salvar" | "compartilhar",
    ) => {
        try {
            const mes = String(invoiceData?.referenceMonth).padStart(2, "0");
            const titulo = `Planilha financeira da conta ${groupName} - ${mes}/${invoiceData?.referenceYear}`;

            const conteudo = genInvoiceFile(invoicePurchases, formato, titulo);

            const nomeArquivo = `fatura-${invoiceData?.referenceMonth}-${invoiceData?.referenceYear}.${formato}`;

            const mimeType =
                formato === "csv"
                    ? "text/csv"
                    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            if (acao === "salvar") {
                // 2a. usuário escolhe a pasta no aparelho
                const pasta = await Directory.pickDirectoryAsync();

                const file = pasta.createFile(nomeArquivo, mimeType);
                file.write(conteudo);

                console.log("Salvo em:", file.uri);
            } else {
                // 2b. grava no cache e abre o menu de compartilhar
                const pasta = new Directory(Paths.cache, "downloads");
                if (!pasta.exists) {
                    pasta.create();
                }

                const file = new File(pasta, nomeArquivo);
                if (file.exists) {
                    file.delete();
                }
                file.create();
                file.write(conteudo);

                if (!(await Sharing.isAvailableAsync())) {
                    console.log(
                        "Compartilhar não está disponível neste aparelho",
                    );
                    return;
                }

                await Sharing.shareAsync(file.uri, {
                    mimeType: mimeType,
                    dialogTitle: "Compartilhar faturas",
                });
            }
        } catch (error) {
            console.error("Erro ao exportar:", error);
        }
    };

    return (
        <View style={styles.main}>
            <StatusBar />
            <BackBtn />
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator color={"#00c89b"} size={"large"} />
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={{
                            paddingBottom: 64,
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            gap: 16,
                            paddingTop: insets.top + 64,
                        }}
                        style={[styles.container]}
                    >
                        <TextDefault style={styles.title}>
                            Exportar dados de {groupName}
                        </TextDefault>
                        <TextDefault style={styles.description}>
                            Exporte os dados da fatura selecionada para CSV ou
                            XLSX, e compartilhe com outros usuários.
                        </TextDefault>
                        <ExportInvoiceSelector
                            invoices={invoices}
                            isSelected={!!selectedInvoice}
                            selectedInvoice={selectedInvoice}
                            setSelectedInvoiceId={setSelectedInvoiceId}
                        />

                        <View
                            style={{
                                width: "100%",
                                gap: 4,
                            }}
                        >
                            <TextDefault style={styles.description}>
                                Formato:
                            </TextDefault>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                }}
                            >
                                <Host matchContents>
                                    <ToggleButton
                                        checked={type === "xlsx"}
                                        onCheckedChange={setType.bind(
                                            null,
                                            "xlsx",
                                        )}
                                        colors={{
                                            checkedContainerColor: "#0B3D22",
                                            checkedContentColor: "#FFFFFF",
                                            containerColor: "#232323",
                                            contentColor: "#eeeeee",
                                        }}
                                    >
                                        <Text>.XLSX</Text>
                                    </ToggleButton>
                                </Host>
                                <Host matchContents>
                                    <ToggleButton
                                        checked={type === "csv"}
                                        onCheckedChange={setType.bind(
                                            null,
                                            "csv",
                                        )}
                                        colors={{
                                            checkedContainerColor: "#0B3D22",
                                            checkedContentColor: "#FFFFFF",
                                            containerColor: "#232323",
                                            contentColor: "#eeeeee",
                                        }}
                                        // modifiers={}
                                    >
                                        <Text>.CSV</Text>
                                    </ToggleButton>
                                </Host>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => handleExport(type, "salvar")}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                {
                                    // bottom: insets.bottom + 16,
                                    // opacity: canSubmit ? 1 : 0.5,
                                    backgroundColor: pressed
                                        ? "#007B5E"
                                        : "#009C7A",
                                },
                            ]}
                            // disabled={!canSubmit}
                        >
                            <TextDefault
                                style={{ color: "#fff", fontWeight: "700" }}
                            >
                                Baixar
                            </TextDefault>
                        </Pressable>
                        <Pressable
                            onPress={() => handleExport(type, "compartilhar")}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                {
                                    // bottom: insets.bottom + 16,
                                    // opacity: canSubmit ? 1 : 0.5,
                                    backgroundColor: pressed
                                        ? "#007B5E"
                                        : "#009C7A",
                                },
                            ]}
                            // disabled={!canSubmit}
                        >
                            <TextDefault
                                style={{ color: "#fff", fontWeight: "700" }}
                            >
                                Compartilhar
                            </TextDefault>
                        </Pressable>
                        <View style={styles.inputContainer}>
                            <TextDefault style={styles.description}>
                                Dica: o formato XLSX sai colorido!
                            </TextDefault>
                        </View>

                        {isError && (
                            <TextDefault
                                style={{ color: "#FF6B6B", marginTop: 8 }}
                            >
                                Não foi possível exportar os dados. Tente
                                novamente mais tarde.
                            </TextDefault>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#161718",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    description: {
        fontSize: 14,
    },
    inputContainer: {
        width: "100%",
        minWidth: "100%",
        backgroundColor: "#142825",
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    label: {
        color: "#eeeeee",
        fontSize: 12,
        textAlign: "center",
    },
    code: {
        color: "#eeeeee",
        fontSize: 28,
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        letterSpacing: 4,
    },

    keyboardContainer: {
        flex: 1,
        zIndex: 1,
    },
    submitBtn: {
        backgroundColor: "#009C7A",
        borderWidth: 2,
        borderColor: "transparent",
        padding: 12,
        borderRadius: 9999,
        justifyContent: "flex-end",
        width: "100%",
        alignItems: "center",
    },
});
