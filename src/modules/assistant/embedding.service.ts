import axios from "axios";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { buildEmbeddingText } from "./embedding.text";

export async function embed(
  text: string,
  type: "document" | "query"
): Promise<number[]> {
  const r = await axios.post(
    "https://api.voyageai.com/v1/embeddings",
    {
      input: [text],
      model: env.EMBEDDING_MODEL || "voyage-3.5",
      input_type: type,
    },
    {
      headers: { Authorization: `Bearer ${env.VOYAGE_API_KEY}` },
      timeout: 15000,
    }
  );
  return r.data.data[0].embedding;
}

const toVector = (v: number[]) => `[${v.join(",")}]`;

export async function indexEvent(eventId: string) {
  try {
    const e = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: { select: { name: true } } },
    });
    if (!e) return;
    const content = buildEmbeddingText(e as any);
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    const existing = await prisma.$queryRaw<{ contentHash: string }[]>`
      SELECT "contentHash" FROM "EventEmbedding" WHERE "eventId" = ${eventId}`;
    if (existing[0]?.contentHash === hash) return;

    const vec = toVector(await embed(content, "document"));
    await prisma.$executeRaw`
      INSERT INTO "EventEmbedding" ("eventId","contentHash","content","embedding","updatedAt")
      VALUES (${eventId}, ${hash}, ${content}, ${vec}::vector, now())
      ON CONFLICT ("eventId") DO UPDATE SET
        "contentHash" = EXCLUDED."contentHash", "content" = EXCLUDED."content",
        "embedding" = EXCLUDED."embedding", "updatedAt" = now()`;
  } catch (error) {
    // If pgvector is not configured or Voyage API fails, fail silently without blocking main operations
    console.warn("indexEvent skipped or failed:", error);
  }
}
