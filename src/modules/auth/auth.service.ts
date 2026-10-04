import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { Role } from "@prisma/client";

import { RegisterInput, LoginInput } from "./auth.interface";

export { RegisterInput, LoginInput };

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError(409, "CONFLICT", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  // BR-02: Public registration always creates role USER
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.USER,
      notificationsEnabled: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      notificationsEnabled: true,
      createdAt: true,
    },
  });

  const token = signToken(user.id, user.role);

  return { token, user };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  // Section 3.5: Same message for wrong email or password to prevent account probing
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  const token = signToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      notificationsEnabled: user.notificationsEnabled,
      createdAt: user.createdAt,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      notificationsEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Account no longer exists.");
  }

  return user;
};
