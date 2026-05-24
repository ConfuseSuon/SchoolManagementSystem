import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { CreateNoticeForm, Notice } from '../types';

export const createNotice = (data: CreateNoticeForm) => api.post<never, { data: Notice }>('/notices', data);

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
};
