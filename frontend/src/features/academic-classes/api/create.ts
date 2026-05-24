import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { CreateClassForm, AcademicClass } from '../types';

export const createClass = (data: CreateClassForm) => api.post<never, { data: AcademicClass }>('/academic-classes', data);

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicClasses.all });
    },
  });
};
