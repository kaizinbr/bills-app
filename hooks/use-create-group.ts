import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

type CreateGroupInput = {
    name: string;
    payerId: string;
    receiverId: string;
    closingDay?: number;
    archived: boolean;
    cards: string;
};

async function createGroup(input: CreateGroupInput) {
    const response = await api.post("/groups", input);
    return response.data;
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
    });
}
