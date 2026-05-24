import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import type { Teacher } from '@/features/teachers/types';

export const getTeacherProfile = async (): Promise<Teacher> => {
  const response: { data: Teacher } = await api.get('/teachers/me');
  return response.data;
};

export const useTeacherProfile = (options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: queryKeys.teacherProfile.current(),
    queryFn: getTeacherProfile,
    ...options,
  });
};
