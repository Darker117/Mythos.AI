import type { StoryCard } from "../types";

export function findActiveCards(
  cards: StoryCard[],
  recentText: string,
): StoryCard[] {
  const lowerText = recentText.toLowerCase();
  return cards.filter((card) => {
    if (!card.enabled) return false;
    const triggers = card.trigger
      .split(",")
      .map((t) => t.trim().toLowerCase());
    return triggers.some((trigger) => trigger && lowerText.includes(trigger));
  });
}

export function formatCardsForPrompt(cards: StoryCard[]): string {
  if (cards.length === 0) return "";
  const entries = cards
    .map((card) => `[${card.type.toUpperCase()}: ${card.trigger}]\n${card.content}`)
    .join("\n\n");
  return `--- WORLD INFO ---\n${entries}\n--- END WORLD INFO ---`;
}
