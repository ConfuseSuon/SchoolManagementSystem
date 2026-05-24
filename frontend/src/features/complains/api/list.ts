import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Complain } from '../types';

export const getComplains = (page = 1) => api.get<never, { data: Complain[], meta: { page: number, total: number } }>(`/complains?page=${page}&limit=10`).then((res) => res);

export const useComplains = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.complains.list({ page }),
    queryFn: () => getComplains(page),
  });
};
