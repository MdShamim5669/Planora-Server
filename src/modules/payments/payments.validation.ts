import { z } from "zod";

export const initPaymentValidationSchema = z.object({
  body: z.object({
    eventId: z.string({ required_error: "eventId is required" }).uuid("Invalid event ID format"),
    invitationId: z.string().uuid("Invalid invitation ID format").optional(),
  }),
});
