
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

// conecta o React Query ao status real de rede do device
onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
    });
});

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 min antes de considerar "velho"
            gcTime: 1000 * 60 * 60 * 24, // mantém no storage por 24h
            retry: 2,
        },
    },
});

const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: "BILLS_APP_CACHE",
});

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
