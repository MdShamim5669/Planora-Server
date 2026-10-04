import { ParticipationStatus, Visibility, InvitationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { PAGINATION } from "../../utils/constants";

// BL-01 Join eligibility helper
export const checkJoinEligibility = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  if (new Date(event.eventDate).getTime() <= Date.now()) {
    throw new ApiError(400, "BAD_REQUEST", "This event has already started or ended.");
  }

  if (event.organizerId === userId) {
    throw new ApiError(403, "FORBIDDEN", "You cannot join your own event.");
  }

  const existingParticipation = await prisma.participation.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existingParticipation) {
    if (
      existingParticipation.status === ParticipationStatus.PENDING ||
      existingParticipation.status === ParticipationStatus.APPROVED
    ) {
      throw new ApiError(409, "CONFLICT", "Already joined or requested.");
    }
    if (existingParticipation.status === ParticipationStatus.REJECTED) {
      throw new ApiError(403, "FORBIDDEN", "Your request was rejected.");
    }
    if (existingParticipation.status === ParticipationStatus.BANNED) {
      throw new ApiError(403, "FORBIDDEN", "You are banned from this event.");
    }
  }

  return event;
};

// BL-02 Join on a free event
export const joinFreeEvent = async (eventId: string, userId: string) => {
  const event = await checkJoinEligibility(eventId, userId);

  if (Number(event.fee) > 0) {
    throw new ApiError(
      402,
      "PAYMENT_REQUIRED",
      "Payment required. Use Pay & Join."
    );
  }

  const initialStatus =
    event.visibility === Visibility.PUBLIC
      ? ParticipationStatus.APPROVED
      : ParticipationStatus.PENDING;

  // In one transaction: create participation, accept any pending invitation
  return prisma.$transaction(async (tx) => {
    const participation = await tx.participation.create({
      data: {
        eventId,
        userId,
        status: initialStatus,
      },
    });

    await tx.invitation.updateMany({
      where: {
        eventId,
        inviteeId: userId,
        status: InvitationStatus.PENDING,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });

    return participation;
  });
};

export const listEventParticipants = async (
  eventId: string,
  userId: string,
  query: { status?: ParticipationStatus; page?: number; limit?: number }
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to view participants.");
  }

  const page = Math.max(1, query.page || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, query.limit || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  const where: any = { eventId };
  if (query.status) {
    where.status = query.status;
  }

  const [total, participants] = await prisma.$transaction([
    prisma.participation.count({ where }),
    prisma.participation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    participants,
    meta: { page, limit, total, totalPages },
  };
};

// BL-06 Moderation transitions
export const moderateParticipant = async (
  participationId: string,
  userId: string,
  action: "approve" | "reject" | "ban"
) => {
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: { event: true },
  });

  if (!participation) {
    throw new ApiError(404, "NOT_FOUND", "Participation record not found");
  }

  if (participation.event.organizerId !== userId) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only the event organizer can moderate participants."
    );
  }

  let nextStatus: ParticipationStatus;

  if (action === "approve") {
    if (participation.status !== ParticipationStatus.PENDING) {
      throw new ApiError(409, "CONFLICT", "Invalid status change");
    }
    nextStatus = ParticipationStatus.APPROVED;
  } else if (action === "reject") {
    if (participation.status !== ParticipationStatus.PENDING) {
      throw new ApiError(409, "CONFLICT", "Invalid status change");
    }
    nextStatus = ParticipationStatus.REJECTED;
  } else if (action === "ban") {
    if (
      participation.status !== ParticipationStatus.PENDING &&
      participation.status !== ParticipationStatus.APPROVED
    ) {
      throw new ApiError(409, "CONFLICT", "Invalid status change");
    }
    nextStatus = ParticipationStatus.BANNED;
  } else {
    throw new ApiError(400, "BAD_REQUEST", "Unknown moderation action");
  }

  return prisma.participation.update({
    where: { id: participationId },
    data: {
      status: nextStatus,
      decidedAt: new Date(),
    },
  });
};

export const getMyParticipations = async (userId: string) => {
  return prisma.participation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          visibility: true,
          fee: true,
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
};
