import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { AdminRegisterForm, ApiResponse } from '../types';

export const registerAdmin = (data: Omit<AdminRegisterForm, 'confirmPassword'>) => 
  api.post<never, ApiResponse<{ _id: string }>>('/admins/register', data);

export const useRegisterAdmin = () => {
  return useMutation({ mutationFn: registerAdmin });
};
