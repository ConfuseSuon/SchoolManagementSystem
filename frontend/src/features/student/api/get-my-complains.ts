import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { queryKeys } from '@/lib/query-keys';
import type { Complain } from '@/features/complains/types';

export const getMyComplains = (page: number) =>
  api.get<never, { data: Complain[]; meta: { page: number; total: number } }>(
    `/complains/mine?page=${page}&limit=10`
  );

export const useMyComplains = (page = 1, options: Record<string, unknown> = {}) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: [...queryKeys.complains.list(), 'my', user?.sub, page],
    queryFn: () => getMyComplains(page),
    enabled: !!user?.sub,
    ...options,
  });
};
