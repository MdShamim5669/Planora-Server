import { Role } from "@prisma/client";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  notificationsEnabled: boolean;
  createdAt: Date;
}
