import { formatDhaka } from "./context";

export function buildEmbeddingText(e: {
  title: string;
  description: string;
  eventDate: Date;
  fee: any;
  visibility: "PUBLIC" | "PRIVATE";
  venue: string | null;
  organizer: { name: string };
}) {
  const paid = Number(e.fee) > 0;
  return [
    `Title: ${e.title}`,
    `Type: ${e.visibility === "PUBLIC" ? "Public" : "Private"}, ${
      paid ? `Paid ${e.fee} BDT` : "Free"
    }`,
    `Organizer: ${e.organizer.name}`,
    `Date: ${formatDhaka(e.eventDate)}`,
    e.visibility === "PUBLIC" && e.venue ? `Venue: ${e.venue}` : "", // private venue is never indexed per privacy rules
    `Description: ${e.description.slice(0, 1500)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
