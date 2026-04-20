import * as z from 'zod';

export const orderStatusSchema = z.object({
  status: z.string().min(1, 'required'),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
