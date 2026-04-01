import { z } from "zod";

export const forgotZodSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type IForgotPayload = z.infer<typeof forgotZodSchema>;
