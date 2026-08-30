// hooks/use-group-total.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

async function fetchGroupTotal(groupId: string): Promise<{ total: number }> {
    const response = await api.get(`/groups/${groupId}/total`);
    return response.data;
}

export function useGroupTotal(groupId: string) {
    return useQuery({
        queryKey: ['group', groupId, 'total'],
        queryFn: () => fetchGroupTotal(groupId),
        enabled: !!groupId,
    });
}