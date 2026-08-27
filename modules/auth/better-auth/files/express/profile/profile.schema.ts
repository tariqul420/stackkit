import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  image: z.string().url().optional(),
});

export type IUpdateProfilePayload = z.infer<typeof updateProfileSchema>;
