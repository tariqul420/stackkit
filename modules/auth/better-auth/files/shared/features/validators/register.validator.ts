import { z } from "zod";

export const registerZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type IRegisterPayload = z.infer<typeof registerZodSchema>;
