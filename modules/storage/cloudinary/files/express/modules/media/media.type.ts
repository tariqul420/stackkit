import { z } from "zod";

export const mediaSignSchema = z.object({
  publicId: z.string().min(1),
  transformation: z.string().min(1).optional(),
});

export const mediaUploadPresignSchema = z.object({
  folder: z.string().min(1).optional(),
  publicId: z.string().min(1).optional(),
  resourceType: z
    .enum(["image", "video", "raw", "auto"] as const)
    .optional()
    .default("auto"),
  unsigned: z.boolean().optional().default(false),
});

export const mediaUploadDeleteSchema = z
  .object({
    keys: z.array(z.string().min(1)).optional(),
    urls: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (value) => (value.keys?.length ?? 0) > 0 || (value.urls?.length ?? 0) > 0,
    {
      message: "keys or urls required",
    },
  );

export type MediaSignInput = z.infer<typeof mediaSignSchema>;
export type MediaUploadPresignInput = z.infer<typeof mediaUploadPresignSchema>;
export type MediaUploadDeleteInput = z.infer<typeof mediaUploadDeleteSchema>;
