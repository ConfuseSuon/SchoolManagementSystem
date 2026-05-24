import { z } from 'zod';

export interface AcademicClass {
  _id: string;
  name: string;
  schoolId: string;
}

export const createClassSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateClassForm = z.infer<typeof createClassSchema>;

export const updateAcademicClassSchema = createClassSchema.partial();
export type UpdateAcademicClassForm = z.infer<typeof updateAcademicClassSchema>;
