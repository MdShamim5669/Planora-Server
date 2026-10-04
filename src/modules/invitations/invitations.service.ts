import { InvitationStatus, ParticipationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export const inviteUser = async (
  eventId: string,
  hostUserId: string,
  email: string
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  if (event.organizerId !== hostUserId) {
    throw new ApiError(403, "FORBIDDEN", "Only the event owner can send invitations.");
  }

  if (new Date(event.eventDate).getTime() <= Date.now()) {
    throw new ApiError(400, "BAD_REQUEST", "Cannot invite users to past events.");
  }

  const invitee = await prisma.user.findUnique({
    where: { email },
  });

  if (!invitee) {
    throw new ApiError(404, "NOT_FOUND", "No registered user found with this email.");
  }

  if (invitee.id === hostUserId) {
    throw new ApiError(400, "BAD_REQUEST", "You cannot invite yourself to your event.");
  }

  // BR-23: Check existing participation
  const existingParticipation = await prisma.participation.findUnique({
    where: {
      eventId_userId: { eventId, userId: invitee.id },
    },
  });

  if (existingParticipation) {
    throw new ApiError(
      409,
      "CONFLICT",
      "User already has a participation record for this event."
    );
  }

  // BR-23: Check existing invitation
  const existingInvitation = await prisma.invitation.findUnique({
    where: {
      eventId_inviteeId: { eventId, inviteeId: invitee.id },
    },
  });

  if (existingInvitation) {
    throw new ApiError(
      409,
      "CONFLICT",
      "An invitation has already been sent to this user."
    );
  }

  return prisma.invitation.create({
    data: {
      eventId,
      inviteeId: invitee.id,
      status: InvitationStatus.PENDING,
    },
    include: {
      invitee: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getEventInvitations = async (eventId: string, hostUserId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  if (event.organizerId !== hostUserId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to view invitations.");
  }

  return prisma.invitation.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      invitee: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getMyInvitations = async (userId: string) => {
  return prisma.invitation.findMany({
    where: {
      inviteeId: userId,
      status: InvitationStatus.PENDING,
      event: { eventDate: { gt: new Date() } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          fee: true,
          visibility: true,
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
};

export const acceptInvitation = async (invitationId: string, userId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { event: true },
  });

  if (!invitation) {
    throw new ApiError(404, "NOT_FOUND", "Invitation not found");
  }

  if (invitation.inviteeId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to accept this invitation.");
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new ApiError(409, "CONFLICT", "Invitation is no longer pending.");
  }

  if (new Date(invitation.event.eventDate).getTime() <= Date.now()) {
    throw new ApiError(400, "BAD_REQUEST", "This event has already started or ended.");
  }

  // BL-05: Paid event returns 402 PAYMENT_REQUIRED
  if (Number(invitation.event.fee) > 0) {
    throw new ApiError(
      402,
      "PAYMENT_REQUIRED",
      "Payment required. Please proceed with Pay & Accept."
    );
  }

  // Free event: transaction that sets invitation ACCEPTED and creates Participation APPROVED (A1)
  return prisma.$transaction(async (tx) => {
    const existingPart = await tx.participation.findUnique({
      where: {
        eventId_userId: {
          eventId: invitation.eventId,
          userId,
        },
      },
    });

    if (existingPart) {
      throw new ApiError(409, "CONFLICT", "Already joined or requested.");
    }

    const updatedInvitation = await tx.invitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });

    const participation = await tx.participation.create({
      data: {
        eventId: invitation.eventId,
        userId,
        status: ParticipationStatus.APPROVED,
      },
    });

    return { invitation: updatedInvitation, participation };
  });
};

export const declineInvitation = async (invitationId: string, userId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new ApiError(404, "NOT_FOUND", "Invitation not found");
  }

  if (invitation.inviteeId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to decline this invitation.");
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new ApiError(409, "CONFLICT", "Invitation is no longer pending.");
  }

  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: InvitationStatus.DECLINED,
      respondedAt: new Date(),
    },
  });
};
