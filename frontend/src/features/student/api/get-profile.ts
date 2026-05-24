import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import type { Student } from '@/features/students/types';

export const getStudentProfile = async (): Promise<Student> => {
  const response: { data: Student } = await api.get('/students/me');
  return response.data;
};

export const useStudentProfile = (options: Record<string, unknown> = {}) => {
  const user = useAuthStore((state) => state.user);
  
  return useQuery({
    queryKey: ['studentProfile', user?.sub],
    queryFn: getStudentProfile,
    enabled: !!user?.sub,
    ...options,
  });
};
