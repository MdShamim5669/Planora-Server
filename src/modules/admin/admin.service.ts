import { Role, Visibility, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { PAGINATION } from "../../utils/constants";

export const getAdminStats = async () => {
  const [userCount, eventCount, participationCount, successfulPaymentCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.participation.count(),
      prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
    ]);

  return {
    users: userCount,
    events: eventCount,
    participations: participationCount,
    successfulPayments: successfulPaymentCount,
  };
};

export const getAllEvents = async (query: { search?: string; page?: number; limit?: number }) => {
  const page = Math.max(1, query.page || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search && query.search.trim().length > 0) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { organizer: { name: { contains: s, mode: "insensitive" } } },
    ];
  }

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { participations: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    events,
    meta: { page, limit, total, totalPages },
  };
};

export const getAllUsers = async (query: { search?: string; page?: number; limit?: number }) => {
  const page = Math.max(1, query.page || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search && query.search.trim().length > 0) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        notificationsEnabled: true,
        createdAt: true,
        _count: { select: { events: true, participations: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    users,
    meta: { page, limit, total, totalPages },
  };
};

export const deleteUserAccount = async (targetUserId: string, currentAdminId: string) => {
  // BR-04: Admin cannot delete their own account
  if (targetUserId === currentAdminId) {
    throw new ApiError(403, "FORBIDDEN", "You cannot delete your own admin account.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new ApiError(404, "NOT_FOUND", "User not found.");
  }

  // BR-04: Admin cannot delete another Admin account
  if (targetUser.role === Role.ADMIN) {
    throw new ApiError(403, "FORBIDDEN", "Admin accounts cannot be deleted.");
  }

  // BR-05: Deleting a user deletes events, participations, invitations, reviews; payments SetNull
  await prisma.user.delete({
    where: { id: targetUserId },
  });

  return { message: "User account deleted successfully" };
};

export const setFeaturedEvent = async (eventId: string, isFeatured: boolean) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found.");
  }

  if (isFeatured) {
    // BR-11: Only a PUBLIC event can be featured
    if (event.visibility !== Visibility.PUBLIC) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Only public events can be set as featured."
      );
    }

    // BL-08: In one transaction set isFeatured = false on all events, then set on target
    await prisma.$transaction([
      prisma.event.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { isFeatured: true },
      }),
    ]);
  } else {
    // Clear featured
    await prisma.event.update({
      where: { id: eventId },
      data: { isFeatured: false },
    });
  }

  return { message: `Event featured status updated to ${isFeatured}` };
};
