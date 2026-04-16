import type { Adventure, LLMSettings } from "../types";
import { generateCompletion, type CompletionMessage } from "./llmClient";

export interface SummarizeResult {
  summary: string;
  newSummarizedUpTo: number;
}

/**
 * Compresses old history into a running story summary.
 *
 * Only fires when the number of unsummarized messages exceeds a threshold
 * (20). Processes in batches of 10 — one LLM call per batch — so the user
 * waits at most a few seconds per turn.
 *
 * Returns `null` if the threshold isn't met or the call fails.
 */
export async function maybeSummarize(
  adventure: Adventure,
  llmSettings: LLMSettings,
): Promise<SummarizeResult | null> {
  const unsummarizedCount = adventure.history.length - adventure.summarizedUpTo;
  if (unsummarizedCount < 20) return null;

  // Take the next batch of 10 unsummarized messages.
  const batchStart = adventure.summarizedUpTo;
  const batchEnd = batchStart + 10;
  const batch = adventure.history.slice(batchStart, batchEnd);

  if (batch.length === 0) return null;

  const batchText = batch
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join("\n\n");

  const existingSummary = adventure.plot.storySummary || "(No summary yet — this is the beginning of the story.)";

  const messages: CompletionMessage[] = [
    {
      role: "system",
      content: `You are a story summary engine for an interactive fiction game. You maintain a running summary of the adventure as it progresses.

Given the current summary and a batch of new messages, produce an UPDATED summary that:
- Covers all key plot points, character introductions, important decisions, and major events
- Stays between 3-6 paragraphs (never longer)
- Preserves important details from the existing summary
- Integrates the new events naturally
- Is written in past tense, third person
- Does NOT include dialogue quotes — paraphrase instead
- Does NOT pad or repeat information

Output ONLY the updated summary text. No headings, no labels, no commentary.`,
    },
    {
      role: "user",
      content: `Current summary:
${existingSummary}

New messages to incorporate:
${batchText}

Updated summary:`,
    },
  ];

  try {
    const summary = await generateCompletion(messages, {
      ...llmSettings,
      temperature: 0.3,
      maxTokens: 800,
    });

    const trimmed = summary.trim();
    if (!trimmed || trimmed.length < 30) return null;

    return {
      summary: trimmed,
      newSummarizedUpTo: batchEnd,
    };
  } catch {
    return null;
  }
}
