import { Prisma, Visibility, Role, ParticipationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { PAGINATION, UPCOMING_SLIDER_LIMIT } from "../../utils/constants";

import {
  ListEventsOptions,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventUser,
} from "./events.interface";

export {
  ListEventsOptions,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventUser,
};

export const listEvents = async (options: ListEventsOptions) => {
  const page = Math.max(1, options.page || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, options.limit || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  const where: Prisma.EventWhereInput = {};

  // Date filtering
  if (!options.includePast) {
    where.eventDate = { gt: new Date() };
  }

  // Type filter per BL-09
  if (options.type) {
    switch (options.type) {
      case "PUBLIC_FREE":
        where.visibility = Visibility.PUBLIC;
        where.fee = 0;
        break;
      case "PUBLIC_PAID":
        where.visibility = Visibility.PUBLIC;
        where.fee = { gt: 0 };
        break;
      case "PRIVATE_FREE":
        where.visibility = Visibility.PRIVATE;
        where.fee = 0;
        break;
      case "PRIVATE_PAID":
        where.visibility = Visibility.PRIVATE;
        where.fee = { gt: 0 };
        break;
    }
  }

  // Search filter per BL-09: title or organizer name
  if (options.search && options.search.trim().length > 0) {
    const searchTerm = options.search.trim();
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { organizer: { name: { contains: searchTerm, mode: "insensitive" } } },
    ];
  }

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { eventDate: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        venue: true,
        eventLink: true,
        visibility: true,
        fee: true,
        isFeatured: true,
        imageUrl: true,
        bannerImage: true,
        createdAt: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    events,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getFeaturedEvent = async () => {
  // BL-08: return featured event; if none, soonest upcoming PUBLIC event; if none, return null
  let event = await prisma.event.findFirst({
    where: {
      isFeatured: true,
      visibility: Visibility.PUBLIC,
      eventDate: { gt: new Date() },
    },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!event) {
    event = await prisma.event.findFirst({
      where: {
        visibility: Visibility.PUBLIC,
        eventDate: { gt: new Date() },
      },
      orderBy: { eventDate: "asc" },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  return event;
};

export const getUpcomingEvents = async () => {
  // BR-12: up to 9 PUBLIC events with eventDate in future, soonest first
  return prisma.event.findMany({
    where: {
      visibility: Visibility.PUBLIC,
      eventDate: { gt: new Date() },
    },
    orderBy: { eventDate: "asc" },
    take: UPCOMING_SLIDER_LIMIT,
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      venue: true,
      eventLink: true,
      fee: true,
      visibility: true,
      isFeatured: true,
      imageUrl: true,
      bannerImage: true,
      createdAt: true,
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getMyEvents = async (userId: string) => {
  return prisma.event.findMany({
    where: { organizerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          participations: true,
        },
      },
    },
  });
};

export const getEventById = async (eventId: string, currentUserId?: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      _count: {
        select: {
          participations: { where: { status: ParticipationStatus.APPROVED } },
          reviews: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  // Calculate review average rating
  const ratingAgg = await prisma.review.aggregate({
    where: { eventId },
    _avg: { rating: true },
  });
  const averageRating = ratingAgg._avg.rating
    ? Math.round(ratingAgg._avg.rating * 10) / 10
    : null;

  // Compute viewer context per BL-10
  let isOwner = false;
  let participationStatus: ParticipationStatus | null = null;
  let invitationStatus: any = null;
  let isAdmin = false;

  if (currentUserId) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });
    isAdmin = user?.role === Role.ADMIN;
    isOwner = event.organizerId === currentUserId;

    const participation = await prisma.participation.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUserId,
        },
      },
    });
    if (participation) {
      participationStatus = participation.status;
    }

    const invitation = await prisma.invitation.findUnique({
      where: {
        eventId_inviteeId: {
          eventId,
          inviteeId: currentUserId,
        },
      },
    });
    if (invitation) {
      invitationStatus = invitation.status;
    }
  }

  // BR-13 & BL-10: Venue & eventLink hiding for PRIVATE events
  const isApprovedParticipant = participationStatus === ParticipationStatus.APPROVED;
  const canSeePrivateLocation =
    event.visibility === Visibility.PUBLIC || isOwner || isAdmin || isApprovedParticipant;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    venue: canSeePrivateLocation ? event.venue : null,
    eventLink: canSeePrivateLocation ? event.eventLink : null,
    visibility: event.visibility,
    fee: event.fee,
    isFeatured: event.isFeatured,
    imageUrl: event.imageUrl,
    bannerImage: event.bannerImage,
    organizer: event.organizer,
    averageRating,
    reviewCount: event._count.reviews,
    approvedCount: event._count.participations,
    viewer: {
      isOwner,
      participationStatus,
      invitationStatus,
    },
  };
};

export const createEvent = async (userId: string, data: any) => {
  return prisma.event.create({
    data: {
      ...data,
      organizerId: userId,
    },
    include: {
      organizer: { select: { id: true, name: true } },
    },
  });
};

export const updateEvent = async (eventId: string, userId: string, data: any) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          participations: true,
          invitations: true,
          payments: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "Only the owner can update an event.");
  }

  // BR-09: If any participation, invitation, or payment, visibility and fee are locked
  const hasRegistrations =
    event._count.participations > 0 ||
    event._count.invitations > 0 ||
    event._count.payments > 0;

  if (hasRegistrations) {
    if (data.visibility !== undefined && data.visibility !== event.visibility) {
      throw new ApiError(
        409,
        "CONFLICT",
        "Event visibility cannot be changed after attendees have registered or been invited."
      );
    }
    if (data.fee !== undefined && Number(data.fee) !== Number(event.fee)) {
      throw new ApiError(
        409,
        "CONFLICT",
        "Event registration fee cannot be changed after attendees have registered or paid."
      );
    }
  }

  return prisma.event.update({
    where: { id: eventId },
    data,
  });
};

export const deleteEvent = async (
  eventId: string,
  user: { id: string; role: Role }
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  // BR-08 / BR-34: Owner or Admin can delete
  if (event.organizerId !== user.id && user.role !== Role.ADMIN) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to delete this event.");
  }

  // Prisma cascades handle participations, invitations, reviews; payments SetNull per schema
  await prisma.event.delete({
    where: { id: eventId },
  });

  return { message: "Event deleted successfully" };
};

export const getGatheringPlans = async () => {
  return [
    {
      id: "public-free",
      type: "PUBLIC_FREE",
      name: "Public Free",
      subtitle: "Free for open communities",
      badge: "1 - 10k",
      price: "৳0",
      fee: 0,
      visibility: "PUBLIC",
      priceUnit: "free forever",
      targetAudience: "For students, open-source & meetups",
      buttonText: "Get started with Free",
      buttonHref: "/dashboard/events/create?type=PUBLIC&fee=FREE",
      features: [
        { text: "Unlimited free attendees" },
        { text: "Instant QR digital pass" },
        { text: "Public search & calendar listing" },
        { text: "Community open discussion" },
      ],
    },
    {
      id: "public-paid",
      type: "PUBLIC_PAID",
      name: "Public Paid",
      subtitle: "Ticketed & revenue summits",
      badge: "500+ scale",
      price: "৳1,500",
      fee: 1500,
      visibility: "PUBLIC",
      priceUnit: "avg. per ticket",
      targetAudience: "For conferences, workshops & festivals",
      hasToggle: true,
      buttonText: "Get started with Pro",
      buttonHref: "/dashboard/events/create?type=PUBLIC&fee=PAID",
      features: [
        { text: "Everything in Public Free" },
        { text: "SSLCommerz automated BDT checkout" },
        { text: "Host approval or instant pass", isNew: true },
        { text: "Custom promo codes & tiers", isNew: true },
      ],
    },
    {
      id: "private-free",
      type: "PRIVATE_FREE",
      name: "Private Free",
      subtitle: "Confidential & unlisted",
      badge: "By Invite",
      price: "Invite",
      fee: 0,
      visibility: "PRIVATE",
      priceUnit: "masked venue",
      targetAudience: "For internal teams & secret gatherings",
      buttonText: "Host Private Event",
      buttonHref: "/dashboard/events/create?type=PRIVATE&fee=FREE",
      features: [
        { text: "Masked venue until approved" },
        { text: "One-time secure invite tokens" },
        { text: "Host guest vetting & gatekeeping" },
        { text: "Zero public feed discovery" },
      ],
    },
    {
      id: "private-paid",
      type: "PRIVATE_PAID",
      name: "Private Paid",
      subtitle: "Vetted executive roundtables",
      badge: "VIP 50+",
      price: "VIP",
      fee: 3500,
      visibility: "PRIVATE",
      priceUnit: "custom tier",
      targetAudience: "For closed high-ticket masterclasses",
      buttonText: "Apply for VIP Access",
      buttonHref: "/dashboard/events/create?type=PRIVATE&fee=PAID",
      features: [
        { text: "Everything from Private Free" },
        { text: "Two-tier verification (Pay + Host)" },
        { text: "Guest NDA & confidentiality" },
        { text: "Dedicated host concierge manager" },
      ],
    },
  ];
};
