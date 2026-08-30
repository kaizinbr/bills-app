import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

import api from "@/lib/api";

async function fetchProfile() {
    try {
        const response = await api.get("/profile");
        return response.data.user;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

export function useProfile() {
    const { data: session } = authClient.useSession();

    return useQuery({
        queryKey: ["profile", session?.user?.id],
        queryFn: fetchProfile,
        enabled: !!session?.user?.id, // só busca se estiver logado
    });
}
