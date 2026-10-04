import { z } from "zod";

export const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must not exceed 80 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "Password must contain at least one letter and one number"
      ),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .transform((val) => val.toLowerCase().trim()),
    password: z.string({ required_error: "Password is required" }),
  }),
});
