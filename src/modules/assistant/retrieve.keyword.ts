import { Prisma, Visibility } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { Filters, RetrievedEvent } from "./assistant.interface";

const STOP = new Set([
  "the", "a", "an", "is", "are", "any", "there", "show", "me", "find", "event",
  "events", "free", "paid", "public", "private", "ache", "kono", "ki", "ekta",
  "dekhao", "khujo", "weekend", "today", "tomorrow", "this", "week", "next",
  "for", "in", "on", "to", "i", "can", "join", "please", "bhai", "amake",
  "bolo", "kichu", "about"
]);

export async function keywordSearch(
  q: string,
  f: Filters,
  k: number
): Promise<RetrievedEvent[]> {
  const words = q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !STOP.has(w));

  const base: Prisma.EventWhereInput = {
    eventDate: { gt: f.from, ...(f.to ? { lt: f.to } : {}) },
    ...(f.visibility ? { visibility: f.visibility } : {}),
    ...(f.fee === "FREE"
      ? { fee: 0 }
      : f.fee === "PAID"
      ? { fee: { gt: 0 } }
      : {}),
  };

  const where: Prisma.EventWhereInput = words.length
    ? {
        ...base,
        OR: words.flatMap((w) => [
          { title: { contains: w, mode: "insensitive" as const } },
          { description: { contains: w, mode: "insensitive" as const } },
          { organizer: { name: { contains: w, mode: "insensitive" as const } } },
          // Private event venue is never searchable per privacy spec BR-40
          {
            visibility: Visibility.PUBLIC,
            venue: { contains: w, mode: "insensitive" as const },
          },
        ]),
      }
    : base;

  const rows = await prisma.event.findMany({
    where,
    include: {
      organizer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { eventDate: "asc" },
    take: 30,
  });

  if (!words.length) {
    return (rows as unknown as RetrievedEvent[]).slice(0, k);
  }

  const score = (e: (typeof rows)[number]) =>
    words.reduce(
      (n, w) =>
        n +
        (e.title.toLowerCase().includes(w) ? 3 : 0) +
        (e.description.toLowerCase().includes(w) ? 1 : 0) +
        (e.organizer.name.toLowerCase().includes(w) ? 2 : 0),
      0
    );

  const sorted = rows.sort((a, b) => score(b) - score(a));
  return (sorted as unknown as RetrievedEvent[]).slice(0, k);
}
