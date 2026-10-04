import { ParticipationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { REVIEW_EDIT_WINDOW_DAYS } from "../../utils/constants";

export const getEventReviews = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.review.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const averageRating = agg._avg.rating
    ? Math.round(agg._avg.rating * 10) / 10
    : null;

  return {
    reviews,
    averageRating,
    reviewCount: agg._count,
  };
};

export const createReview = async (
  eventId: string,
  userId: string,
  data: { rating: number; comment?: string | null }
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(404, "NOT_FOUND", "Event not found");
  }

  // BR-35: Only after event has started
  if (new Date(event.eventDate).getTime() > Date.now()) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Reviews can only be submitted after the event has started."
    );
  }

  // BR-35: Only for APPROVED participants
  const participation = await prisma.participation.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (!participation || participation.status !== ParticipationStatus.APPROVED) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only approved participants can review this event."
    );
  }

  // BR-36: One review per user per event
  const existingReview = await prisma.review.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existingReview) {
    throw new ApiError(
      409,
      "CONFLICT",
      "You have already reviewed this event."
    );
  }

  return prisma.review.create({
    data: {
      eventId,
      userId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
};

export const updateReview = async (
  reviewId: string,
  userId: string,
  data: { rating?: number; comment?: string | null }
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  if (review.userId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to edit this review.");
  }

  // BR-37: Only within 7 days
  const elapsedDays =
    (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (elapsedDays > REVIEW_EDIT_WINDOW_DAYS) {
    throw new ApiError(403, "FORBIDDEN", "The review period has ended.");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data,
  });
};

export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  if (review.userId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to delete this review.");
  }

  // BR-37: Only within 7 days
  const elapsedDays =
    (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (elapsedDays > REVIEW_EDIT_WINDOW_DAYS) {
    throw new ApiError(403, "FORBIDDEN", "The review period has ended.");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: "Review deleted successfully" };
};

export const getMyReviews = async (userId: string) => {
  return prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
};
