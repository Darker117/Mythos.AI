import type { Adventure, AppSettings, ChatMessage } from "../types";
import type { CompletionMessage } from "./llmClient";
import { findActiveCards, formatCardsForPrompt } from "./cardEngine";
import type { InputMode } from "../store/gameStore";

const BASE_SYSTEM_PROMPT = `You are the narrator of an interactive fiction adventure. You write immersive, engaging, second-person narrative prose. You describe the world vividly and react dynamically to the player's choices. Keep your responses between 2-4 paragraphs. Never break character. Never mention that you are an AI.`;

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
    if (plot.storySummary) parts.push(`Story Summary So Far:\n${plot.storySummary}`);
  }

  return parts.join("\n\n");
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

export function buildMessages(
  adventure: Adventure,
  userInput: string,
  inputMode: InputMode,
  settings: AppSettings,
): CompletionMessage[] {
  const messages: CompletionMessage[] = [];

  // 1. System prompt
  messages.push({
    role: "system",
    content: buildSystemPrompt(adventure),
  });

  // 2. Pinned memory
  if (adventure.memory.trim()) {
    messages.push({
      role: "system",
      content: `--- MEMORY (always remember) ---\n${adventure.memory}\n--- END MEMORY ---`,
    });
  }

  // 3. Story cards triggered by recent text
  const recentText = adventure.history
    .slice(-6)
    .map((m) => m.content)
    .join(" ");
  const fullContext = recentText + " " + userInput;
  const activeCards = findActiveCards(adventure.storyCards, fullContext);
  const cardBlock = formatCardsForPrompt(activeCards);
  if (cardBlock) {
    messages.push({ role: "system", content: cardBlock });
  }

  // 4. History (windowed)
  const window = settings.historyWindow;
  const historySlice = adventure.history.slice(-window);
  for (const msg of historySlice) {
    messages.push({
      role: msg.role === "system" ? "system" : msg.role,
      content: msg.content,
    });
  }

  // 5. Current user input
  const formattedInput = formatUserInput(userInput, inputMode);
  messages.push({ role: "user", content: formattedInput });

  return messages;
}

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
