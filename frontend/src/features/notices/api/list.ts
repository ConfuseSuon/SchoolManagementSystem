import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Notice } from '../types';

export const getNotices = (page = 1) => api.get<never, { data: Notice[], meta: { page: number, total: number } }>(`/notices?page=${page}&limit=10`).then((res) => res);

export const useNotices = (page = 1, options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.notices.list({ page }),
    queryFn: () => getNotices(page),
    ...options,
  });
};
