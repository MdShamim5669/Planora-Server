import { AnyZodObject, ZodTypeAny } from "zod";
import { Role } from "@prisma/client";

export interface ValidationSchema {
  body?: AnyZodObject | ZodTypeAny;
  query?: AnyZodObject | ZodTypeAny;
  params?: AnyZodObject | ZodTypeAny;
}

export type ValidatableSchema = AnyZodObject | ZodTypeAny | ValidationSchema;

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}
