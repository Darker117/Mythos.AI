import type { Adventure, AppSettings, ChatMessage, StoryEvent } from "../types";
import type { CompletionMessage } from "./llmClient";
import { findActiveCards, formatCardsForPrompt } from "./cardEngine";
import type { InputMode } from "../store/gameStore";

const BASE_SYSTEM_PROMPT = `You are the narrator of an interactive fiction adventure. You write immersive, engaging, second-person narrative prose. You describe the world vividly and react dynamically to the player's choices. Keep your responses between 2-4 paragraphs. Never break character. Never mention that you are an AI.`;

/** Conservative chars-per-token estimate for English text. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

function buildSystemPrompt(adventure: Adventure): string {
  const parts: string[] = [BASE_SYSTEM_PROMPT];

  if (adventure.genre) {
    parts.push(`Genre: ${adventure.genre}`);
  }

  if (adventure.systemPrompt) {
    parts.push(`Setting & Rules:\n${adventure.systemPrompt}`);
  }

  const plot = adventure.plot;
  if (plot) {
    if (plot.aiInstructions) parts.push(`AI Instructions:\n${plot.aiInstructions}`);
    if (plot.authorsNote) parts.push(`Author's Note (style/tone guide):\n${plot.authorsNote}`);
  }

  // Inject world-state awareness into the narrator's instructions.
  const ws = adventure.worldState;
  if (ws && ws.currentLocation !== "Unknown") {
    const npcs = ws.activeNPCs.length > 0 ? ws.activeNPCs.join(", ") : "no one notable";
    parts.push(
      `--- CURRENT WORLD STATE ---\n` +
      `The player is currently at: ${ws.currentLocation}\n` +
      `Present in the scene: ${npcs}\n` +
      `Player status: ${ws.playerStatus}\n` +
      `Last development: ${ws.recentDevelopment || "N/A"}\n` +
      `Maintain continuity with these facts. Do not contradict them.\n` +
      `--- END WORLD STATE ---`,
    );
  }

  return parts.join("\n\n");
}

function formatEventsBlock(events: StoryEvent[]): string {
  if (!events || events.length === 0) return "";
  const recent = events.slice(-10);
  const bullets = recent.map((e) => `• ${e.summary}`).join("\n");
  return `--- KEY EVENTS ---\n${bullets}\n--- END KEY EVENTS ---`;
}

function formatUserInput(text: string, mode: InputMode): string {
  switch (mode) {
    case "do":
      return `> You ${text.charAt(0).toLowerCase() + text.slice(1)}`;
    case "say":
      return `> You say "${text}"`;
    case "story":
      return text;
    case "see":
      return `> You look around and observe: ${text}`;
  }
}

/**
 * Assembles the message array for a gameplay turn, fitting content into
 * the user's configured context length.
 *
 * Priority order (highest first):
 *   1. System prompt (narrator + genre + AI instructions + world state preamble)
 *   2. Current user input
 *   3. Pinned memory
 *   4. Running story summary
 *   5. Key events (last 10)
 *   6. Active story cards
 *   7. Recent history (fills remaining budget, most recent first)
 */
export function buildMessages(
  adventure: Adventure,
  userInput: string,
  inputMode: InputMode,
  settings: AppSettings,
): CompletionMessage[] {
  const maxBudget = settings.llm.contextLength - 1200; // reserve ~1200 tokens for response
  let budget = maxBudget;

  const messages: CompletionMessage[] = [];

  // 1. System prompt — always included.
  const systemContent = buildSystemPrompt(adventure);
  messages.push({ role: "system", content: systemContent });
  budget -= estimateTokens(systemContent);

  // 2. Current user input — always included (measured but never skipped).
  const formattedInput = formatUserInput(userInput, inputMode);
  budget -= estimateTokens(formattedInput);

  // 3. Pinned memory.
  if (adventure.memory.trim()) {
    const memBlock = `--- MEMORY (always remember) ---\n${adventure.memory}\n--- END MEMORY ---`;
    const cost = estimateTokens(memBlock);
    if (budget - cost > 0) {
      messages.push({ role: "system", content: memBlock });
      budget -= cost;
    }
  }

  // 4. Running story summary.
  const summary = adventure.plot?.storySummary;
  if (summary && summary.trim()) {
    const sumBlock = `--- STORY SUMMARY ---\n${summary}\n--- END STORY SUMMARY ---`;
    const cost = estimateTokens(sumBlock);
    if (budget - cost > 0) {
      messages.push({ role: "system", content: sumBlock });
      budget -= cost;
    }
  }

  // 5. Key events.
  const eventsBlock = formatEventsBlock(adventure.events);
  if (eventsBlock) {
    const cost = estimateTokens(eventsBlock);
    if (budget - cost > 0) {
      messages.push({ role: "system", content: eventsBlock });
      budget -= cost;
    }
  }

  // 6. Active story cards — triggered by world state context + recent text + user input.
  const recentText = adventure.history
    .slice(-6)
    .map((m) => m.content)
    .join(" ");
  const wsContext = adventure.worldState
    ? `${adventure.worldState.currentLocation} ${adventure.worldState.activeNPCs.join(" ")}`
    : "";
  const fullContext = `${recentText} ${userInput} ${wsContext}`;
  const activeCards = findActiveCards(adventure.storyCards, fullContext);
  const cardBlock = formatCardsForPrompt(activeCards);
  if (cardBlock) {
    const cost = estimateTokens(cardBlock);
    if (budget - cost > 0) {
      messages.push({ role: "system", content: cardBlock });
      budget -= cost;
    }
  }

  // 7. Recent history — fill remaining budget, most recent first.
  const historyMessages: CompletionMessage[] = [];
  for (let i = adventure.history.length - 1; i >= 0 && budget > 100; i--) {
    const msg = adventure.history[i]!;
    const cost = estimateTokens(msg.content);
    if (budget - cost < 0) break;
    historyMessages.unshift({
      role: msg.role === "system" ? "system" : msg.role,
      content: msg.content,
    });
    budget -= cost;
  }
  messages.push(...historyMessages);

  // Always end with the user input.
  messages.push({ role: "user", content: formattedInput });

  return messages;
}

/**
 * Builds messages for the opening scene of an adventure.
 * Simpler than buildMessages — no history, no user input, no events yet.
 */
export function buildInitialMessages(adventure: Adventure): CompletionMessage[] {
  const messages: CompletionMessage[] = [];

  messages.push({
    role: "system",
    content: buildSystemPrompt(adventure),
  });

  if (adventure.memory.trim()) {
    messages.push({
      role: "system",
      content: `--- MEMORY (always remember) ---\n${adventure.memory}\n--- END MEMORY ---`,
    });
  }

  const activeCards = findActiveCards(
    adventure.storyCards,
    adventure.setting + " " + adventure.systemPrompt,
  );
  const cardBlock = formatCardsForPrompt(activeCards);
  if (cardBlock) {
    messages.push({ role: "system", content: cardBlock });
  }

  messages.push({
    role: "user",
    content: `Begin the adventure. Set the scene based on the setting described above. Write an engaging opening that draws the player in and ends with a moment of choice or action.${
      adventure.setting ? `\n\nSetting details: ${adventure.setting}` : ""
    }`,
  });

  return messages;
}

export function createChatMessage(
  role: "user" | "assistant",
  content: string,
  inputMode?: InputMode,
): ChatMessage {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    role,
    content,
    timestamp: Date.now(),
    inputMode,
  };
}
