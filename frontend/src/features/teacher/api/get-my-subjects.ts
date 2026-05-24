import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import type { Subject } from '@/features/subjects/types';

export const getMySubjects = async (teacherId: string): Promise<Subject[]> => {
  const response: { data: Subject[] } = await api.get('/subjects?limit=100');
  const subjects: Subject[] = response.data || [];
  return subjects.filter((s) => {
    if (typeof s.teacherId === 'object' && s.teacherId !== null) {
      return (s.teacherId as { _id: string })._id === teacherId;
    }
    return s.teacherId === teacherId;
  });
};

export const useMySubjects = (options: Record<string, unknown> = {}) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: [...queryKeys.subjects.list(), 'my', user?.sub],
    queryFn: () => getMySubjects(user?.sub as string),
    enabled: !!user?.sub,
    ...options,
  });
};
