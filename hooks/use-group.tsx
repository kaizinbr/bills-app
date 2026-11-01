import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type UserSummary = {
    id: string;
    name: string;
    image: string | null;
};

type Card = {
    id: string;
    name: string;
    color: string | null;
    digits: string | null;
    closingDay: number | null;
    ownerId: string;
    createdById: string;
    archived: boolean;
    groupId: string;
    createdAt: string;
    updatedAt: string;
};

type Subscription = {
    id: string;
    name: string;
    amount: number;
    chargeDay: number;
    startDate: string;
    canceledAt: string | null;
    categoryId: string | null;
    cardId: string | null;
    groupId: string;
    userId: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
};

type Category = {
    id: string;
    key: string;
    label: string;
    icon: string | null;
    type:
        | "FOOD"
        | "TRANSPORT"
        | "SHOPPING"
        | "HEALTH"
        | "ENTERTAINMENT"
        | "SUBSCRIPTION"
        | "INSTALLMENT"
        | "LOAN"
        | "BILLS"
        | "OTHER";
    createdById: string | null;
    archived: boolean;
    createdAt: string;
};

type Purchase = {
    id: string;
    description: string;
    amount: number;
    purchasedAt: string;
    categoryId: string | null;
    invoiceId: string | null;
    cardId: string | null;
    userId: string | null;
    installmentPlanId: string | null;
    installmentNumber: number | null;
    subscriptionId: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
};

type InstallmentPlan = {
    id: string;
    description: string;
    totalAmount: number;
    installments: number;
    dayOfMonth: number;
    startDate: string;
    cancelledAt: string | null;
    categoryId: string | null;
    cardId: string | null;
    groupId: string;
    userId: string | null;
    createdById: string;
    createdAt: string;
    category: Category | null;
    card: Card | null;
    purchases: Purchase[];
};

export type Group = {
    id: string;
    name: string;
    debtorId: string | null;
    creditorId: string | null;
    creditorName: string | null;
    limit: number | null;
    inviteCode: string;
    closingDay: number | null;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
    cards: Card[];
    subscriptions?: Subscription[];
    userDebtorId?: UserSummary | null;
    groupMembers?: {
        id: string;
        groupId: string;
        userId: string;
        role: "OWNER" | "MEMBER";
        joinedAt: string;
        user: UserSummary;
    }[];
    _count?: {
        subscriptions: number;
        cards: number;
        installmentPlans: number;
    };
    invoices?: {
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
    installmentPlans?: InstallmentPlan[];
};

export type GroupsResponse = {
    groups: Group[];
};

export type GroupResponse = {
    group: Group;
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


async function fetchGroupMembers(groupId: string) {
    try {
        const response = await api.get(`/groups/${groupId}/members`);
        return response.data.groupMembers;
    } catch (error) {
        console.error("Error fetching group Members:", error);
        throw error;
    }
}

export function useGroupMembers(groupId: string) {
    return useQuery({
        queryKey: ["group", groupId, "members"],
        queryFn: () => fetchGroupMembers(groupId),
        enabled: !!groupId,
    });
}
