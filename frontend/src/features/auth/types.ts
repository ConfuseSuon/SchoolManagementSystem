import { z } from 'zod';

export const adminStepOneSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminStepTwoSchema = z.object({
  schoolId: z.string().min(1, 'Please select a school'),
});

export const staffLoginSchema = z.object({
  role: z.enum(['Teacher', 'Student']),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminStepOneForm = z.infer<typeof adminStepOneSchema>;
export type AdminStepTwoForm = z.infer<typeof adminStepTwoSchema>;
export type StaffLoginForm = z.infer<typeof staffLoginSchema>;

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AdminStepOneResponse {
  tempToken: string;
  schools: { _id: string; name: string }[];
}

export interface LoginResponse {
  access_token: string;
}

export const adminRegisterSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolAddress: z.string().min(1, 'School address is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AdminRegisterForm = z.infer<typeof adminRegisterSchema>;
