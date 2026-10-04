import { z } from "zod";

export const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80).optional(),
    phone: z.string().max(20).optional().nullable(),
  }),
});

export const updateNotificationsValidationSchema = z.object({
  body: z.object({
    notificationsEnabled: z.boolean({
      required_error: "notificationsEnabled must be a boolean",
    }),
  }),
});
