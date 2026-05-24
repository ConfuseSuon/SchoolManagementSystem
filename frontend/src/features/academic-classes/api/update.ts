import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateAcademicClassForm, AcademicClass } from '../types';

export const updateAcademicClass = (id: string, data: UpdateAcademicClassForm) => 
  api.patch<never, { data: AcademicClass }>(`/academic-classes/${id}`, data);

export const useUpdateAcademicClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicClassForm }) => updateAcademicClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicClasses.all });
    },
  });
};
