import type { StoryCard } from "../types";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findActiveCards(
  cards: StoryCard[],
  recentText: string,
): StoryCard[] {
  return cards.filter((card) => {
    if (!card.enabled) return false;
    const triggers = card.trigger
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return triggers.some((trigger) => {
      // Word-boundary match prevents false positives like "arch" matching "marching".
      const pattern = new RegExp(`\\b${escapeRegex(trigger)}\\b`, "i");
      return pattern.test(recentText);
    });
  });
}

export function formatCardsForPrompt(cards: StoryCard[]): string {
  if (cards.length === 0) return "";
  const entries = cards
    .map((card) => `[${card.type.toUpperCase()}: ${card.trigger}]\n${card.content}`)
    .join("\n\n");
  return `--- WORLD INFO ---\n${entries}\n--- END WORLD INFO ---`;
}
