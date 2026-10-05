import { RetrievedEvent } from "./assistant.interface";
import { AuthUser } from "../../middlewares/authenticate";
import { canSeeLocation } from "./privacy";

export const formatDhaka = (d: Date | string) => {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dateObj);
};

export function buildContext(
  events: RetrievedEvent[],
  viewer: AuthUser | null | undefined,
  statusMap: Map<string, string>,
  now: Date
): string {
  // Clean description to avoid prompt injection (e.g. user writing </events>)
  const clean = (s: string) =>
    (s || "")
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u001f]/g, " ")
      .slice(0, 300)
      .trim();

  const items = events.map((e, i) => {
    const st = statusMap.get(e.id) ?? "NONE";
    const hasAccess = canSeeLocation(e, viewer, st);

    const loc = hasAccess
      ? [
          e.venue && `venue: ${clean(e.venue)}`,
          e.eventLink && `online link: available on the event page`,
        ]
          .filter(Boolean)
          .join("; ") || "venue: not set"
      : "venue: hidden until approved";

    const isPaid = Number(e.fee) > 0;
    const feeStr = isPaid ? `Paid, ${e.fee} BDT` : "Free";

    return [
      `[${i + 1}] title: ${clean(e.title)}`,
      `date: ${formatDhaka(e.eventDate)} (Asia/Dhaka)`,
      `type: ${e.visibility === "PUBLIC" ? "Public" : "Private"}, ${feeStr}`,
      `organizer: ${clean(e.organizer.name)}`,
      loc,
      `description: ${clean(e.description)}`,
      `yourStatus: ${st}`,
    ].join("\n");
  });

  return `Current date and time: ${formatDhaka(now)} (Asia/Dhaka)\n\n<events>\n${
    items.join("\n\n") || "No matching events found."
  }\n</events>`;
}
