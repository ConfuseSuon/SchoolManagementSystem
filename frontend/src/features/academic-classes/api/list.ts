import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { AcademicClass } from '../types';

export const getClasses = (page = 1) => api.get<never, { data: AcademicClass[], meta: { page: number, total: number } }>(`/academic-classes?page=${page}&limit=10`).then((res) => res);

export const useClasses = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.academicClasses.list({ page }),
    queryFn: () => getClasses(page),
  });
};
