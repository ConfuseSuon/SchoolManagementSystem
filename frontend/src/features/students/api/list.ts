import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Student } from '../types';

export const getStudents = (page = 1) => api.get<never, { data: Student[], meta: { page: number, total: number } }>(`/students?page=${page}&limit=10`).then((res) => res);

export const useStudents = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.students.list({ page }),
    queryFn: () => getStudents(page),
  });
};
