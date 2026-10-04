import { z } from "zod";

export const setFeatureValidationSchema = z.object({
  body: z.object({
    isFeatured: z.boolean({ required_error: "isFeatured is required" }),
  }),
});

export const adminListQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
  }),
});
