import { z } from 'zod';
import type { AcademicClass } from '../academic-classes/types';

export interface Student {
  _id: string;
  name: string;
  email: string;
  schoolId: string;
  classId: string | AcademicClass;
  rollNumber?: string;
}

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password is required'),
  classId: z.string().min(1, 'Class is required'),
  rollNumber: z.string().optional(),
});

export type CreateStudentForm = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  rollNumber: z.string().optional(),
});
export type UpdateStudentForm = z.infer<typeof updateStudentSchema>;
