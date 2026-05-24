import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Notice } from '../types';

export const deleteNotice = (id: string) => api.delete<never, { data: Notice }>('/notices/' + id);

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
};
