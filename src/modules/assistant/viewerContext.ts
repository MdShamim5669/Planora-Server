import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../middlewares/authenticate";

export async function getViewerContext(
  viewer: AuthUser | null | undefined
): Promise<Map<string, string>> {
  if (!viewer) return new Map<string, string>();

  const [owned, parts] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: viewer.id },
      select: { id: true },
    }),
    prisma.participation.findMany({
      where: { userId: viewer.id },
      select: { eventId: true, status: true },
    }),
  ]);

  const m = new Map<string, string>();
  owned.forEach((o) => m.set(o.id, "OWNER"));
  parts.forEach((p) => m.set(p.eventId, p.status)); // PENDING, APPROVED, REJECTED, etc.
  return m;
}
