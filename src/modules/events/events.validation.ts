import { z } from "zod";
import { Visibility } from "@prisma/client";

export const createEventValidationSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: "Title is required" })
        .min(3, "Title must be at least 3 characters")
        .max(120, "Title must not exceed 120 characters"),
      description: z
        .string({ required_error: "Description is required" })
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description must not exceed 5000 characters"),
      eventDate: z
        .string({ required_error: "Event date is required" })
        .datetime("Invalid ISO datetime string")
        .refine(
          (val) => new Date(val).getTime() > Date.now(),
          "Event date must be in the future"
        ),
      venue: z.string().max(255).optional().nullable(),
      eventLink: z.string().url("Invalid event URL").optional().nullable(),
      visibility: z.nativeEnum(Visibility, {
        required_error: "Visibility is required (PUBLIC or PRIVATE)",
      }),
      fee: z
        .number({ required_error: "Fee is required" })
        .min(0, "Fee must be 0 or more")
        .max(1000000, "Fee cannot exceed 1,000,000")
        .refine(
          (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
          "Fee can have at most 2 decimal places"
        ),
      imageUrl: z.string().url("Invalid image URL").optional().nullable(),
      bannerImage: z.string().url("Invalid banner image URL").optional().nullable(),
    })
    .refine((data) => (data.venue && data.venue.trim().length > 0) || (data.eventLink && data.eventLink.trim().length > 0), {
      message: "Provide a venue or an event link",
      path: ["venue"],
    }),
});

export const updateEventValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).max(5000).optional(),
    eventDate: z
      .string()
      .datetime("Invalid ISO datetime string")
      .refine(
        (val) => new Date(val).getTime() > Date.now(),
        "Event date cannot be moved to the past"
      )
      .optional(),
    venue: z.string().max(255).optional().nullable(),
    eventLink: z.string().url("Invalid event URL").optional().nullable(),
    visibility: z.nativeEnum(Visibility).optional(),
    fee: z
      .number()
      .min(0)
      .max(1000000)
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
        message: "Fee can have at most 2 decimal places",
      })
      .optional(),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    bannerImage: z.string().url("Invalid banner image URL").optional().nullable(),
  }),
});

export const listEventsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z
      .enum(["PUBLIC_FREE", "PUBLIC_PAID", "PRIVATE_FREE", "PRIVATE_PAID"])
      .optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
    includePast: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  }),
});
