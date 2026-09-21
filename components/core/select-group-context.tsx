import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const STORAGE_KEY = "selectedGroupId";

type SelectedGroupContextValue = {
    selectedGroupId: string | null;
    setSelectedGroupId: (groupId: string) => void;
    // true quando já terminou de ler o AsyncStorage — evita usar o valor
    // "null" inicial como se fosse "nenhuma conta selecionada de verdade"
    isLoaded: boolean;
};

const SelectedGroupContext = createContext<SelectedGroupContextValue | null>(
    null,
);

export function SelectedGroupProvider({ children }: { children: ReactNode }) {
    const [selectedGroupId, setSelectedGroupIdState] = useState<
        string | null
    >(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((stored) => {
                if (stored) setSelectedGroupIdState(stored);
            })
            .finally(() => setIsLoaded(true));
    }, []);

    const setSelectedGroupId = (groupId: string) => {
        setSelectedGroupIdState(groupId);
        AsyncStorage.setItem(STORAGE_KEY, groupId).catch(() => {
            // falha silenciosa: pior caso, na próxima abertura do app
            // volta a cair no fallback (1ª conta da lista)
        });
    };

    return (
        <SelectedGroupContext.Provider
            value={{ selectedGroupId, setSelectedGroupId, isLoaded }}
        >
            {children}
        </SelectedGroupContext.Provider>
    );
}

export function useSelectedGroup() {
    const context = useContext(SelectedGroupContext);
    if (!context) {
        throw new Error(
            "useSelectedGroup precisa ser usado dentro de um SelectedGroupProvider",
        );
    }
    return context;
}