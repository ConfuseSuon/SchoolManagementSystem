import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Teacher } from '../types';

export const getTeachers = (page = 1) => api.get<never, { data: Teacher[], meta: { page: number, total: number } }>(`/teachers?page=${page}&limit=10`).then((res) => res);

export const useTeachers = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.teachers.list({ page }),
    queryFn: () => getTeachers(page),
  });
};
