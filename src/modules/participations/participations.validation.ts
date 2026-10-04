import { z } from "zod";
import { ParticipationStatus } from "@prisma/client";

export const listParticipantsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(ParticipationStatus).optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
  }),
});
