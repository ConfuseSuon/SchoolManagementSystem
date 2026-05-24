import { z } from 'zod';

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  schoolId: string;
}

export const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required'),
});

export type CreateTeacherForm = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({ name: z.string().min(1, 'Name is required').optional() });
export type UpdateTeacherForm = z.infer<typeof updateTeacherSchema>;
