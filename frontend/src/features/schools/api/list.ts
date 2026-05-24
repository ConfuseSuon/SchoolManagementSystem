import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { School } from '../types';

export const getSchools = (page = 1) => api.get<never, { data: School[], meta: { page: number, total: number } }>(`/schools?page=${page}&limit=10`).then((res) => res);

export const useSchools = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.schools.list({ page }),
    queryFn: () => getSchools(page),
  });
};
