import { generateCompletion } from "./llmClient";
import type { CompletionMessage } from "./llmClient";
import type { StoryCard, LLMSettings } from "../types";

// Shape the LLM is expected to return for each card candidate
interface RawCardCandidate {
  type: StoryCard["type"];
  name: string;
  trigger: string;
  content: string;
}

/**
 * Builds the system + user messages for the card-detection call.
 * Keeping the prompt construction separate makes it easy to test or tweak
 * without touching the async logic.
 */
function buildDetectionMessages(
  responseText: string,
  existingNames: string[],
): CompletionMessage[] {
  const existingList =
    existingNames.length > 0
      ? existingNames.map((n) => `"${n}"`).join(", ")
      : "none";

  const systemPrompt = `You are a world-building assistant for an AI-driven story engine. \
Your job is to read a narrative passage and identify any NEW, significant entities introduced \
that deserve a story card entry. A story card captures persistent world-knowledge about a named \
entity so it can be referenced consistently in future scenes.

Rules:
- Only flag entities that appear SIGNIFICANT to the story (named characters, notable locations, \
important factions, meaningful items, or pivotal events). Ignore throwaway or generic mentions.
- Do NOT create cards for entities that are already covered. The existing card names are: ${existingList}.
- For each new entity produce exactly these fields:
    type    – one of: character | location | item | lore | event | faction | class | race
    name    – the entity's proper name as it appears in the text
    trigger – 2–3 comma-separated keywords a reader might use to reference this entity
    content – 2–3 sentences of world-info describing the entity
- Respond with ONLY a valid JSON array. No markdown fences, no prose, no extra keys.
- If nothing new and significant was introduced, respond with an empty array: []

Example output format:
[
  {
    "type": "character",
    "name": "Seraphina Voss",
    "trigger": "Seraphina, Voss, the archivist",
    "content": "Seraphina Voss is the head archivist of the Obsidian Vault. She speaks in clipped sentences and trusts no one who cannot prove their bloodline. She secretly harbours a stolen relic beneath her desk."
  }
]`;

  const userPrompt = `Narrative passage to analyse:

---
${responseText.trim()}
---

Identify any NEW significant entities not already in the existing card list and return the JSON array.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

/**
 * Strips an optional markdown code-fence wrapper that some models add despite
 * being told not to, so JSON.parse still succeeds.
 */
function stripMarkdownFence(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Validates that a raw candidate has the minimum fields needed to build a
 * StoryCard. Returns false for anything that looks malformed.
 */
function isValidCandidate(candidate: unknown): candidate is RawCardCandidate {
  if (!candidate || typeof candidate !== "object") return false;
  const c = candidate as Record<string, unknown>;

  const validTypes: StoryCard["type"][] = [
    "character",
    "location",
    "item",
    "lore",
    "event",
    "faction",
    "class",
    "race",
  ];

  return (
    typeof c.type === "string" &&
    validTypes.includes(c.type as StoryCard["type"]) &&
    typeof c.name === "string" &&
    c.name.trim().length > 0 &&
    typeof c.trigger === "string" &&
    c.trigger.trim().length > 0 &&
    typeof c.content === "string" &&
    c.content.trim().length > 0
  );
}

/** Generates a simple unique id without external dependencies. */
function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Analyses the latest AI narrative response and auto-generates StoryCards for
 * any NEW significant entities it introduces.
 *
 * @param responseText  The raw narrative text returned by the storytelling LLM.
 * @param existingCards The cards already saved in the adventure, used to avoid
 *                      creating duplicates.
 * @param llmSettings   The user's LLM configuration. Temperature and maxTokens
 *                      are overridden to lower values suitable for a structured,
 *                      utility-style call.
 * @returns             An array of freshly minted StoryCards (may be empty).
 *                      Never throws — failures are caught and logged so they
 *                      cannot disrupt gameplay.
 */
export async function detectAndGenerateCards(
  responseText: string,
  existingCards: StoryCard[],
  llmSettings: LLMSettings,
): Promise<StoryCard[]> {
  try {
    // Build a deduplicated list of existing names to pass into the prompt
    const existingNames = existingCards
      .map((c) => c.name.trim())
      .filter(Boolean);

    const messages = buildDetectionMessages(responseText, existingNames);

    // Use a lower temperature and token budget — this is structured extraction,
    // not creative writing, so we want deterministic, concise output.
    const detectionSettings: LLMSettings = {
      ...llmSettings,
      temperature: 0.3,
      maxTokens: 1000,
    };

    const raw = await generateCompletion(messages, detectionSettings);

    if (!raw || raw.trim().length === 0) {
      return [];
    }

    const cleaned = stripMarkdownFence(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.warn("[cardGenerator] LLM returned non-JSON output:", cleaned);
      return [];
    }

    if (!Array.isArray(parsed)) {
      console.warn("[cardGenerator] Expected a JSON array, got:", typeof parsed);
      return [];
    }

    // Filter out any malformed entries, then map to full StoryCard objects
    const newCards: StoryCard[] = parsed
      .filter(isValidCandidate)
      .map((candidate) => ({
        id: generateId(),
        type: candidate.type,
        name: candidate.name.trim(),
        trigger: candidate.trigger.trim(),
        content: candidate.content.trim(),
        notes: "",
        enabled: true,
      }));

    return newCards;
  } catch (error) {
    // A failure here must never crash the game loop
    console.error("[cardGenerator] Failed to detect/generate cards:", error);
    return [];
  }
}
