import { api } from '@/lib/axios';
import type { 
  AdminStepOneForm, 
  AdminStepTwoForm, 
  StaffLoginForm,
  ApiResponse,
  AdminStepOneResponse,
  LoginResponse
} from './types';

export const authApi = {
  adminStepOne: (data: AdminStepOneForm) => 
    api.post<never, ApiResponse<AdminStepOneResponse>>('/auth/admin/step-one', data),
  adminStepTwo: (data: AdminStepTwoForm & { tempToken: string }) => 
    api.post<never, ApiResponse<LoginResponse>>('/auth/admin/step-two', data),
  staffLogin: (data: StaffLoginForm) => 
    api.post<never, ApiResponse<LoginResponse>>('/auth/staff/login', data),
};
