import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { AcademicClass } from '../types';

export const deleteClass = (id: string) => api.delete<never, { data: AcademicClass }>('/academic-classes/' + id);

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicClasses.all });
    },
  });
};
