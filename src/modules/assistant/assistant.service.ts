import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env";
import {
  AskAssistantInput,
  AskAssistantResult,
  RetrievedEvent,
  AssistantEventCard,
} from "./assistant.interface";
import { parseFilters } from "./filters";
import { getViewerContext } from "./viewerContext";
import { keywordSearch } from "./retrieve.keyword";
import { buildContext } from "./context";
import { SYSTEM_PROMPT } from "./prompt";

let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic | null {
  if (!anthropicClient && env.ANTHROPIC_API_KEY) {
    try {
      anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    } catch {
      anthropicClient = null;
    }
  }
  return anthropicClient;
}

export async function askAssistant({
  question,
  history = [],
  viewer,
}: AskAssistantInput): Promise<AskAssistantResult> {
  const now = new Date();
  const filters = parseFilters(question, now);
  const statusMap = await getViewerContext(viewer);

  let events: RetrievedEvent[] = [];
  let usedRetriever: "vector" | "keyword" = "keyword";

  // Vector mode with automatic keyword fallback
  if (env.RETRIEVER === "vector") {
    try {
      // Lazy load vector search if configured
      const { vectorSearch } = await import("./retrieve.vector");
      events = await vectorSearch(question, filters, env.ASSISTANT_TOP_K);
      usedRetriever = "vector";
    } catch {
      // Fallback to keyword
      usedRetriever = "keyword";
    }
  }

  if (!events.length) {
    events = await keywordSearch(question, filters, env.ASSISTANT_TOP_K);
    usedRetriever = "keyword";
  }

  // If question is about events viewer can join, exclude events where viewer is OWNER, BANNED, or REJECTED
  if (/join/i.test(question) && viewer) {
    events = events.filter((e) => {
      const st = statusMap.get(e.id);
      return !["OWNER", "BANNED", "REJECTED"].includes(st ?? "");
    });
  }

  const context = buildContext(events, viewer, statusMap, now);

  // Take only last 6 messages of history and ensure first message has role 'user'
  const past = history.slice(-6).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content.slice(0, 1000),
  }));
  while (past.length && past[0].role !== "user") {
    past.shift();
  }

  let answer = "";
  const client = getAnthropicClient();

  if (client) {
    try {
      const msg = await client.messages.create({
        model: env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [
          ...past,
          { role: "user", content: `${context}\n\nQuestion: ${question}` },
        ],
      });

      answer = msg.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
    } catch (err) {
      console.error("Assistant Claude API call failed:", err);
      answer =
        "Sorry, I couldn't write a full answer right now. Here are the closest events I found on Planora.";
    }
  } else {
    answer =
      events.length > 0
        ? `Here are the matching events found on Planora:`
        : "No matching events found at this time. Try adjusting your search query.";
  }

  // Parse cited event numbers e.g. [1], [2]
  const cited = [
    ...new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]))),
  ].filter((n) => n >= 1 && n <= events.length);

  // Map citations to real server-verified event cards
  const selectedEvents = cited.length
    ? cited.map((n) => events[n - 1])
    : events.slice(0, 3);

  const cards: AssistantEventCard[] = selectedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate,
    visibility: e.visibility,
    fee: e.fee,
    organizer: { name: e.organizer.name },
    yourStatus: statusMap.get(e.id) ?? "NONE",
  }));

  // Clean citation bracket artifacts from answer text for clean display
  const cleanAnswer = answer.replace(/\s*\[\d+\]/g, "").trim();

  return {
    answer: cleanAnswer || answer,
    events: cards,
    usedRetriever,
  };
}
