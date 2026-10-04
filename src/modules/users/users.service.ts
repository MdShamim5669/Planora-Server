import { prisma } from "../../lib/prisma";

export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string | null }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      notificationsEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateNotifications = async (
  userId: string,
  notificationsEnabled: boolean
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notificationsEnabled: true,
    },
  });
};
