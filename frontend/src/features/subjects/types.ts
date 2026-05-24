import { z } from 'zod';
import type { AcademicClass } from '../academic-classes/types';

export interface Subject {
  _id: string;
  name: string;
  code?: string;
  classId: string | AcademicClass;
  teacherId?: string;
  schoolId: string;
}

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  teacherId: z.string().optional(),
});

export type CreateSubjectForm = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial();
export type UpdateSubjectForm = z.infer<typeof updateSubjectSchema>;
