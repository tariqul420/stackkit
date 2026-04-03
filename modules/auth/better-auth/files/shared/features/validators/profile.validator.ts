import { z } from "zod";

export const profileZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
});

export type IProfilePayload = z.infer<typeof profileZodSchema>;
