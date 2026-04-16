import { generateCompletion } from "./llmClient";
import type { CompletionMessage } from "./llmClient";
import type { StoryCard, LLMSettings } from "../types";

interface RawCardCandidate {
  type: StoryCard["type"];
  name: string;
  trigger: string;
  content: string;
  /** If true, this is an update to an existing card rather than a new one. */
  isUpdate?: boolean;
}

/** Result includes both newly created cards and updates to existing ones. */
export interface CardGenerationResult {
  newCards: StoryCard[];
  updatedCards: { id: string; content: string; trigger: string }[];
}

/** Normalize a name for fuzzy comparison: lowercase, strip articles, trim. */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDetectionMessages(
  responseText: string,
  existingNames: string[],
): CompletionMessage[] {
  const existingList =
    existingNames.length > 0
      ? existingNames.map((n) => `"${n}"`).join(", ")
      : "none";

  const systemPrompt = `You are a world-building assistant for an AI-driven story engine. \
Your job is to read a narrative passage and identify significant entities that need story cards.

Rules:
- Flag entities that are SIGNIFICANT to the story (named characters, notable locations, \
important factions, meaningful items, or pivotal events). Ignore throwaway or generic mentions.
- The existing card names are: ${existingList}.
- If an existing entity has a MAJOR new revelation (betrayal, hidden identity, new ability, death), \
include it with "isUpdate": true and the SAME name so the card can be updated. Only do this for \
genuinely significant new information — not minor details.
- For truly NEW entities, produce a fresh card with "isUpdate": false (or omit the field).
- For each entity produce exactly these fields:
    type      – one of: character | location | item | lore | event | faction | class | race
    name      – the entity's proper name as it appears in the text
    trigger   – 2–3 comma-separated keywords a reader might use to reference this entity
    content   – 2–3 sentences of world-info describing the entity (or the update)
    isUpdate  – boolean, true only if updating an existing card
- Respond with ONLY a valid JSON array. No markdown fences, no prose, no extra keys.
- If nothing new or significant was introduced, respond with: []`;

  const userPrompt = `Narrative passage to analyse:

---
${responseText.trim()}
---

Identify any NEW or significantly UPDATED entities and return the JSON array.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

function stripMarkdownFence(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isValidCandidate(candidate: unknown): candidate is RawCardCandidate {
  if (!candidate || typeof candidate !== "object") return false;
  const c = candidate as Record<string, unknown>;

  const validTypes: StoryCard["type"][] = [
    "character", "location", "item", "lore", "event", "faction", "class", "race",
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

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Analyses the latest AI narrative response and auto-generates or updates
 * StoryCards for significant entities.
 *
 * Uses fuzzy name matching to prevent duplicates ("Sera" vs "Seraphina")
 * and can return card updates when an existing entity gets a major revelation.
 */
export async function detectAndGenerateCards(
  responseText: string,
  existingCards: StoryCard[],
  llmSettings: LLMSettings,
): Promise<CardGenerationResult> {
  try {
    const existingNames = existingCards.map((c) => c.name.trim()).filter(Boolean);
    const messages = buildDetectionMessages(responseText, existingNames);

    const raw = await generateCompletion(messages, {
      ...llmSettings,
      temperature: 0.3,
      maxTokens: 1000,
    });

    if (!raw || raw.trim().length === 0) {
      return { newCards: [], updatedCards: [] };
    }

    const cleaned = stripMarkdownFence(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { newCards: [], updatedCards: [] };
    }

    if (!Array.isArray(parsed)) {
      return { newCards: [], updatedCards: [] };
    }

    const validCandidates = parsed.filter(isValidCandidate);

    // Build a normalized-name → card map for fuzzy matching.
    const normalizedMap = new Map<string, StoryCard>();
    for (const card of existingCards) {
      normalizedMap.set(normalizeName(card.name), card);
    }

    const newCards: StoryCard[] = [];
    const updatedCards: { id: string; content: string; trigger: string }[] = [];

    for (const candidate of validCandidates) {
      const normalizedCandidateName = normalizeName(candidate.name);

      // Check if this matches an existing card (exact or fuzzy).
      const existingMatch =
        normalizedMap.get(normalizedCandidateName) ??
        // Also try matching against card triggers for alias coverage.
        existingCards.find((c) =>
          c.trigger
            .split(",")
            .some((t) => normalizeName(t) === normalizedCandidateName),
        );

      if (existingMatch && candidate.isUpdate) {
        // Update existing card with new content.
        updatedCards.push({
          id: existingMatch.id,
          content: `${existingMatch.content}\n\n[UPDATE]: ${candidate.content.trim()}`,
          trigger: existingMatch.trigger, // keep existing triggers
        });
      } else if (!existingMatch) {
        // Truly new card — no fuzzy match found.
        newCards.push({
          id: generateId(),
          type: candidate.type,
          name: candidate.name.trim(),
          trigger: candidate.trigger.trim(),
          content: candidate.content.trim(),
          notes: "",
          enabled: true,
        });
      }
      // If existingMatch found but NOT isUpdate, skip — avoids creating duplicates.
    }

    return { newCards, updatedCards };
  } catch (error) {
    console.error("[cardGenerator] Failed:", error);
    return { newCards: [], updatedCards: [] };
  }
}
