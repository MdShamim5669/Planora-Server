import { z } from "zod";

export const createReviewValidationSchema = z.object({
  body: z.object({
    rating: z
      .number({ required_error: "Rating is required" })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z
      .string()
      .max(1000, "Comment cannot exceed 1000 characters")
      .optional()
      .nullable(),
  }),
});

export const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional().nullable(),
  }),
});
