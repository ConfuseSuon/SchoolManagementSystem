import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';

export const createComplainSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  complaint: z.string().min(1, 'Complaint is required'),
});

export type CreateComplainDto = z.infer<typeof createComplainSchema>;

export const useCreateComplain = () => {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: CreateComplainDto) => api.post('/complains', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complains.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.complains.list(), 'my', user?.sub] });
      showToast('Complaint submitted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to submit complaint', 'error');
    },
  });
};
