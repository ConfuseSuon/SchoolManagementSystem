import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';

export const useAdminStepOne = () => {
  return useMutation({ mutationFn: authApi.adminStepOne });
};

export const useAdminStepTwo = () => {
  return useMutation({ mutationFn: authApi.adminStepTwo });
};

export const useStaffLogin = () => {
  return useMutation({ mutationFn: authApi.staffLogin });
};
