import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminStats {
  totalSchools: number;
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
}

export const getAdminStats = () => api.get<never, { data: AdminStats }>('/stats').then((res) => res.data);

export const useAdminStats = (options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    ...options,
  });
};
