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
import { vectorSearch } from "./retrieve.vector";
import { buildContext } from "./context";
import { SYSTEM_PROMPT } from "./prompt";

let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic | null {
  if (!anthropicClient && env.ANTHROPIC_API_KEY) {
    try {
      const defaultHeaders: Record<string, string> = {};
      if (env.ANTHROPIC_WORKSPACE_ID) {
        defaultHeaders["anthropic-workspace-id"] = env.ANTHROPIC_WORKSPACE_ID;
      }
      anthropicClient = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
        defaultHeaders: Object.keys(defaultHeaders).length > 0 ? defaultHeaders : undefined,
      });
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
  let claudeSuccess = false;
  const client = getAnthropicClient();

  if (client) {
    try {
      const msg = await client.messages.create({
        model: env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
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
      if (answer) {
        claudeSuccess = true;
      }
    } catch (err) {
      console.warn("Assistant Claude API call fallback activated:", err);
    }
  }

  const isBangla = /[\u0980-\u09FF]/.test(question) || /kono|ache|dekhao|ki|korte|pari/i.test(question);

  if (!claudeSuccess || !answer) {
    if (events.length > 0) {
      answer = isBangla
        ? `আপনার অনুসন্ধানের ভিত্তিতে Planora-তে ${events.length}টি আসন্ন ইভেন্ট পাওয়া গেছে:`
        : `Here are the top ${events.length} upcoming events found on Planora that match your search:`;
    } else {
      answer = isBangla
        ? "এই মুহূর্তে আপনার পছন্দের সাথে মিলে এমন কোনো ইভেন্ট পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো তারিখ বা কিওয়ার্ড দিয়ে চেষ্টা করুন।"
        : "No matching upcoming events found on Planora at this time. Please try adjusting your date or search keywords.";
    }
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
    suggestions: generateFollowUpSuggestions(question, events, isBangla),
  };
}

function generateFollowUpSuggestions(
  question: string,
  events: RetrievedEvent[],
  isBangla: boolean
): string[] {
  const hasFree = events.some((e) => Number(e.fee) === 0);
  const hasPaid = events.some((e) => Number(e.fee) > 0);

  if (isBangla) {
    if (events.length === 0) {
      return [
        "এই সপ্তাহের ফ্রি ইভেন্ট দেখাও",
        "টেকনোলজি ও কোডিং মিটআপ",
        "সব পাবলিক ইভেন্ট দেখাও",
      ];
    }
    const suggestions: string[] = [];
    if (hasPaid && !hasFree) {
      suggestions.push("ফ্রি ইভেন্টগুলো দেখাও");
    } else if (hasFree && !hasPaid) {
      suggestions.push("পেইড কর্মশালা ও মাস্টারক্লাস");
    } else {
      suggestions.push("এই উইকেন্ডের ইভেন্টগুলো");
    }

    if (!/join/i.test(question)) {
      suggestions.push("যেগুলোতে আমি জয়েন করতে পারব");
    } else {
      suggestions.push("অনলাইন বা টেক মিটআপ");
    }

    suggestions.push("আগামীকালের ইভেন্টগুলো কী কী?");
    return [...new Set(suggestions)].slice(0, 3);
  }

  if (events.length === 0) {
    return [
      "Free events this weekend",
      "Technology and coding meetups",
      "Show all upcoming events",
    ];
  }

  const suggestions: string[] = [];
  if (hasPaid && !hasFree) {
    suggestions.push("Free events this weekend");
  } else if (hasFree && !hasPaid) {
    suggestions.push("Paid workshops & masterclasses");
  } else {
    suggestions.push("Free events this weekend");
  }

  if (!/join/i.test(question)) {
    suggestions.push("Events I can join");
  } else {
    suggestions.push("Tech and coding meetups");
  }

  if (/weekend/i.test(question)) {
    suggestions.push("Events happening today");
  } else {
    suggestions.push("Paid workshops");
  }

  return [...new Set(suggestions)].slice(0, 3);
}
