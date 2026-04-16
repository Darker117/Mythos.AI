import type { WorldState, LLMSettings } from "../types";
import { DEFAULT_WORLD_STATE } from "../types";
import { generateCompletion, type CompletionMessage } from "./llmClient";

/**
 * Extracts structured world state from the latest narrative response.
 * Runs as a utility LLM call after the main prose generation.
 *
 * Returns the previous state if the call fails or parsing is invalid —
 * world state extraction is never allowed to break gameplay.
 */
export async function extractWorldState(
  latestResponse: string,
  currentState: WorldState,
  llmSettings: LLMSettings,
): Promise<WorldState> {
  const messages: CompletionMessage[] = [
    {
      role: "system",
      content: `You are a world-state extraction engine for an interactive fiction game. Given the latest narrative passage and the previous world state, output ONLY a valid JSON object with these exact fields:

{
  "currentLocation": "string — where the player currently is",
  "activeNPCs": ["array of NPC names currently present in the scene"],
  "playerStatus": "string — key conditions: healthy, injured, disguised, cursed, etc.",
  "recentDevelopment": "string — 1-2 sentence summary of what just happened in this passage"
}

Rules:
- If something hasn't changed from the previous state, keep the previous value.
- activeNPCs should ONLY include NPCs who are physically present and interactable in the current scene, not every character ever mentioned.
- recentDevelopment should capture the most important thing that happened — not a full retelling.
- Output ONLY the JSON. No markdown, no explanation, no commentary.`,
    },
    {
      role: "user",
      content: `Previous world state:
${JSON.stringify(currentState, null, 2)}

Latest narrative passage:
${latestResponse}

Extract the updated world state as JSON:`,
    },
  ];

  try {
    const raw = await generateCompletion(messages, {
      ...llmSettings,
      temperature: 0.2,
      maxTokens: 500,
    });

    const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      currentLocation:
        typeof parsed.currentLocation === "string" && parsed.currentLocation.trim()
          ? parsed.currentLocation.trim()
          : currentState.currentLocation,
      activeNPCs: Array.isArray(parsed.activeNPCs)
        ? parsed.activeNPCs.filter((n: unknown): n is string => typeof n === "string" && n.trim() !== "")
        : currentState.activeNPCs,
      playerStatus:
        typeof parsed.playerStatus === "string" && parsed.playerStatus.trim()
          ? parsed.playerStatus.trim()
          : currentState.playerStatus,
      recentDevelopment:
        typeof parsed.recentDevelopment === "string" && parsed.recentDevelopment.trim()
          ? parsed.recentDevelopment.trim()
          : currentState.recentDevelopment,
    };
  } catch {
    // Never break gameplay — return previous state on any failure.
    return currentState ?? { ...DEFAULT_WORLD_STATE };
  }
}
