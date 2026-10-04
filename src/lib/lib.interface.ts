import { Role } from "@prisma/client";

export interface IAuthPayload {
  userId: string;
  role: Role;
  email?: string;
}

export interface ITokenOptions {
  expiresIn?: string;
}
