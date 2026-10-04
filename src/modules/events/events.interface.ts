import { Visibility, ParticipationStatus, Role } from "@prisma/client";

export interface ListEventsOptions {
  search?: string;
  type?: "PUBLIC_FREE" | "PUBLIC_PAID" | "PRIVATE_FREE" | "PRIVATE_PAID";
  page?: number;
  limit?: number;
  includePast?: boolean;
}

export interface CreateEventInput {
  title: string;
  description: string;
  eventDate: string | Date;
  venue?: string | null;
  eventLink?: string | null;
  visibility: Visibility;
  fee?: number | string;
  imageUrl?: string | null;
  bannerImage?: string | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  eventDate?: string | Date;
  venue?: string | null;
  eventLink?: string | null;
  visibility?: Visibility;
  fee?: number | string;
  imageUrl?: string | null;
  bannerImage?: string | null;
}

export interface EventViewerContext {
  isOwner: boolean;
  participationStatus: ParticipationStatus | null;
  invitationStatus: any;
}

export interface DeleteEventUser {
  id: string;
  role: Role;
}
