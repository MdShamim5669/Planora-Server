import { z } from "zod";

export const createInvitationValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .transform((val) => val.toLowerCase().trim()),
  }),
});
