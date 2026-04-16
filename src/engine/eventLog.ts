import type { StoryEvent, LLMSettings } from "../types";
import { generateCompletion, type CompletionMessage } from "./llmClient";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Extracts 0-3 key plot events from the latest narrative response.
 *
 * Events are structural story beats — not every little action. The model is
 * instructed to be selective: alliance formed, betrayal revealed, location
 * discovered, major character introduced, item acquired, etc.
 *
 * Returns an empty array on failure — event extraction is non-critical.
 */
export async function extractEvents(
  latestResponse: string,
  currentTurn: number,
  llmSettings: LLMSettings,
): Promise<StoryEvent[]> {
  const messages: CompletionMessage[] = [
    {
      role: "system",
      content: `You are a plot-event extraction engine for an interactive fiction game. Read the latest narrative passage and extract 0-3 key plot events.

A "key plot event" is a structural story beat — something that changes the direction or stakes of the story:
- A major new character is introduced
- An alliance or betrayal occurs
- An important item is acquired or lost
- A new location is discovered or entered
- A quest objective is completed or failed
- A significant reveal or twist happens
- A major battle or confrontation occurs

Do NOT extract mundane actions (walking, looking, talking about nothing important).

Return a JSON array of objects: [{"summary": "short 1-sentence description of the event"}]
Return [] if nothing significant happened in this passage.
Output ONLY the JSON array. No markdown, no explanation.`,
    },
    {
      role: "user",
      content: `Latest narrative passage:
${latestResponse}

Extract key plot events as JSON:`,
    },
  ];

  try {
    const raw = await generateCompletion(messages, {
      ...llmSettings,
      temperature: 0.2,
      maxTokens: 400,
    });

    const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    return parsed
      .filter(
        (e: unknown): e is { summary: string } =>
          typeof e === "object" &&
          e !== null &&
          "summary" in e &&
          typeof (e as { summary: unknown }).summary === "string" &&
          (e as { summary: string }).summary.trim().length > 5,
      )
      .slice(0, 3) // hard cap
      .map((e) => ({
        id: generateId(),
        summary: e.summary.trim(),
        turn: currentTurn,
        timestamp: now,
      }));
  } catch {
    return [];
  }
}
