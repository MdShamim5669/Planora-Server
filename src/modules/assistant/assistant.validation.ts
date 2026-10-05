import { z } from "zod";

export const askSchema = z.object({
  body: z.object({
    question: z
      .string({ required_error: "Question is required." })
      .trim()
      .min(2, "Question must be at least 2 characters long.")
      .max(500, "Question must not exceed 500 characters."),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(1000, "Message content too long."),
        })
      )
      .max(6, "History cannot exceed 6 messages.")
      .optional()
      .default([]),
  }),
});
