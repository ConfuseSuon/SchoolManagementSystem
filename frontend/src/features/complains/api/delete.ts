import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Complain } from '../types';

export const deleteComplain = (id: string) => api.delete<never, { data: Complain }>('/complains/' + id);

export const useDeleteComplain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComplain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complains.all });
    },
  });
};
