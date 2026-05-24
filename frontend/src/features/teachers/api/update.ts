import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateTeacherForm, Teacher } from '../types';

export const updateTeacher = (id: string, data: UpdateTeacherForm) => 
  api.patch<never, { data: Teacher }>(`/teachers/${id}`, data);

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherForm }) => updateTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
};
