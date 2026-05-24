import { z } from 'zod';

export interface School {
  _id: string;
  name: string;
  address: string;
  adminId: string;
}

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
});

export type CreateSchoolForm = z.infer<typeof createSchoolSchema>;

export const updateSchoolSchema = createSchoolSchema.partial();
export type UpdateSchoolForm = z.infer<typeof updateSchoolSchema>;
