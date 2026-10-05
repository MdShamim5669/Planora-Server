import { Visibility } from "@prisma/client";
import { AuthUser } from "../../middlewares/authenticate";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Filters {
  fee: "FREE" | "PAID" | null;
  visibility: "PUBLIC" | "PRIVATE" | null;
  from: Date;
  to: Date | null;
}

export interface RetrievedEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  venue: string | null;
  eventLink: string | null;
  visibility: Visibility;
  fee: any;
  organizerId: string;
  organizer: {
    id?: string;
    name: string;
  };
}

export interface AssistantEventCard {
  id: string;
  title: string;
  eventDate: Date | string;
  visibility: Visibility;
  fee: any;
  organizer: {
    name: string;
  };
  yourStatus: string;
}

export interface AskAssistantInput {
  question: string;
  history?: ChatMessage[];
  viewer?: AuthUser | null;
}

export interface AskAssistantResult {
  answer: string;
  events: AssistantEventCard[];
  usedRetriever: "keyword" | "vector";
  suggestions?: string[];
}
