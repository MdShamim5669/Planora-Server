import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Filters, RetrievedEvent } from './assistant.interface';
import { embed } from './embedding.service';

export async function vectorSearch(q: string, f: Filters, k: number): Promise<RetrievedEvent[]> {
  try {
    const embedding = await embed(q, 'query');
    const qv = `[${embedding.join(',')}]`;

    const fee = f.fee === 'FREE' ? Prisma.sql`AND e."fee" = 0` : f.fee === 'PAID' ? Prisma.sql`AND e."fee" > 0` : Prisma.empty;
    const vis = f.visibility ? Prisma.sql`AND e."visibility" = ${f.visibility}::"Visibility"` : Prisma.empty;
    const to = f.to ? Prisma.sql`AND e."eventDate" < ${f.to}` : Prisma.empty;

    const hits = await prisma.$queryRaw<{ id: string; distance: number }[]>`
      SELECT e."id", (ee."embedding" <=> ${qv}::vector) AS distance
      FROM "EventEmbedding" ee JOIN "Event" e ON e."id" = ee."eventId"
      WHERE e."eventDate" > ${f.from} ${to} ${fee} ${vis}
      ORDER BY ee."embedding" <=> ${qv}::vector
      LIMIT ${k}`;

    const good = hits.filter((h) => h.distance < 0.6);
    if (!good.length) return [];

    const rows = await prisma.event.findMany({
      where: { id: { in: good.map((h) => h.id) } },
      include: { organizer: { select: { id: true, name: true } } },
    });

    const resultMap = new Map(rows.map((r) => [r.id, r]));
    return good.map((h) => resultMap.get(h.id)).filter(Boolean) as RetrievedEvent[];
  } catch (error) {
    // If pgvector is not installed or EventEmbedding table doesn't exist yet, return empty array to trigger keyword search fallback
    return [];
  }
}
