import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

type Group = {
    id: string;
    name: string;
    closingDay: number;
    archived: boolean;
    cards: { id: string; name: string; color: string }[];
    debtor?: { id: string; name: string; image: string | null };
    invoices?: {
        id: string;
    }
    _count?: {
        subscriptions: number;
    }
};

type GroupsResponse = {
    creditorGroups: Group[];
    debtorGroups: Group[];
};

async function fetchGroups(): Promise<GroupsResponse> {
    const response = await api.get("/groups");
    return response.data;
}

export function useGroups() {
    return useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });
}

async function fetchGroupTotal(groupId: string) {
    try {
        const response = await api.get(`/groups/${groupId}/total`);
        return response.data;
    } catch (error) {
        console.error("Error fetching group total:", error);
        throw error;
    }
}

export function useGroupTotal(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "total"],
        queryFn: () => fetchGroupTotal(groupId),
        enabled: !!groupId,
    });
}

async function fetchGroupPurchases(groupId: string) {
    try {
        const response = await api.get(`/groups/${groupId}/purchases`);
        return response.data;
    } catch (error) {
        console.error("Error fetching group purchases:", error);
        throw error;
    }
}

export function useGroupPurchases(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "purchases"],
        queryFn: () => fetchGroupPurchases(groupId),
        enabled: !!groupId,
    });
}
