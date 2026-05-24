import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateNoticeForm, Notice } from '../types';

export const updateNotice = (id: string, data: UpdateNoticeForm) => 
  api.patch<never, { data: Notice }>(`/notices/${id}`, data);

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeForm }) => updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
};
