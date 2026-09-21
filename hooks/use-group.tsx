import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export type Group = {
    id: string;
    name: string;
    limit: string;
    closingDay: number;
    archived: boolean;
    cards: { id: string; name: string; color: string }[];
    debtor?: { id: string; name: string; image: string | null } | null;
    invoices: {
        id: string;
        groupId: string;
        cardId: string | null;
        periodStart: string;
        closingDate: string;
        status: "OPEN" | "CLOSED" | "PAID";
        paidAt: string | null;
        createdAt: string;
        updatedAt: string;
    }[];
    _count?: {
        subscriptions: number;
        cards: number;
    };
    members?: {
        id: string;
        groupId: string;
        userId: string;
        role: "OWNER" | "MEMBER";
        user: {
            id: string;
            name: string;
            image: string | null;
        };
    }[];
};

export type GroupsResponse = {
    groups: Group[];
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
