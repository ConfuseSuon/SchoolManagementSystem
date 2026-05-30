import { z } from 'zod';

export interface Teacher {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  schoolId: string;
}

export const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  gender: z.string().optional(),
});

export type CreateTeacherForm = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
});
export type UpdateTeacherForm = z.infer<typeof updateTeacherSchema>;

