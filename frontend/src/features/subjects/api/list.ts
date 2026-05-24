import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Subject } from '../types';

export const getSubjects = (page = 1) => api.get<never, { data: Subject[], meta: { page: number, total: number } }>(`/subjects?page=${page}&limit=10`).then((res) => res);

export const useSubjects = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.subjects.list({ page }),
    queryFn: () => getSubjects(page),
  });
};
