import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateStudentForm, Student } from '../types';

export const updateStudent = (id: string, data: UpdateStudentForm) => 
  api.patch<never, { data: Student }>(`/students/${id}`, data);

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentForm }) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};
