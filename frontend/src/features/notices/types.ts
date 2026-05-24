import { z } from 'zod';

export interface Notice {
  _id: string;
  title: string;
  details: string;
  date: string;
  schoolId: string;
}

export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  details: z.string().min(1, 'Details are required'),
  date: z.string().min(1, 'Date is required'),
});

export type CreateNoticeForm = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = createNoticeSchema.partial();
export type UpdateNoticeForm = z.infer<typeof updateNoticeSchema>;
