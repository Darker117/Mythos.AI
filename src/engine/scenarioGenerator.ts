import { generateCompletion, type CompletionMessage } from "./llmClient";
import type { LLMSettings, StoryCard, PlotData } from "../types";

export interface GeneratedScenario {
  name: string;
  genre: string;
  description: string;
  setting: string;
  tags: string[];
  plot: PlotData;
  storyCards: StoryCard[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const GENERATION_PROMPT = `You are a creative writing assistant that generates rich, detailed adventure scenarios for an interactive fiction game.

Generate a completely random and unique adventure scenario. Be creative — pick an unexpected genre, setting, and premise.

You MUST respond with ONLY valid JSON (no markdown, no code fences, no explanation) in this exact format:

{
  "name": "Adventure Title",
  "genre": "Genre",
  "description": "A 2-3 sentence description of the adventure premise.",
  "setting": "A detailed paragraph describing the world, era, atmosphere, and key locations.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "plot": {
    "aiInstructions": "Instructions for the AI narrator about tone, pacing, and special rules for this world.",
    "plotEssentials": "Key facts the narrator must always remember: major characters, conflicts, world rules.",
    "authorsNote": "A brief note about the desired writing style and atmosphere.",
    "storySummary": "",
    "openingType": "story",
    "openingContent": "A compelling opening paragraph that sets the scene and draws the player in."
  },
  "storyCards": [
    {
      "type": "character",
      "name": "Character Name",
      "trigger": "trigger_word1, trigger_word2",
      "content": "Detailed description of this character, their motivations, appearance, and role in the story.",
      "notes": ""
    },
    {
      "type": "location",
      "name": "Location Name",
      "trigger": "trigger_word",
      "content": "Vivid description of this place.",
      "notes": ""
    }
  ]
}

Generate EXACTLY 10 story cards with a good mix of types. Use these types:
- "character" (at least 3): important NPCs with personality, appearance, motivations
- "location" (at least 2): key places with vivid descriptions
- "faction" (at least 1): an organization, group, or political entity
- "race" (1 if applicable): a species or people group
- "item" (at least 1): a significant object, weapon, artifact, or resource
- "event" (at least 1): a notable occurrence, prophecy, or ongoing conflict
- "lore" (1 if applicable): a legend, historical fact, or world-building detail

Each trigger field should contain 2-3 comma-separated keywords that would naturally appear in the story when this card is relevant.
Each content field should be 2-4 sentences of rich detail.

Be wildly creative. Don't default to generic fantasy. Consider: noir detective, deep sea exploration, time-loop horror, solarpunk utopia, mythological underworld, dying earth, mech warfare, dream heist, cursed carnival, etc.`;

export async function generateRandomScenario(
  llmSettings: LLMSettings,
): Promise<GeneratedScenario> {
  const messages: CompletionMessage[] = [
    { role: "system", content: GENERATION_PROMPT },
    { role: "user", content: "Generate a random adventure scenario now." },
  ];

  const response = await generateCompletion(messages, {
    ...llmSettings,
    temperature: 1.1,
    maxTokens: 3000,
  });

  // Parse — strip any markdown fences the LLM might add despite instructions
  let jsonStr = response.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonStr) as {
    name: string;
    genre: string;
    description: string;
    setting: string;
    tags: string[];
    plot: PlotData;
    storyCards: Array<{
      type: string;
      name: string;
      trigger: string;
      content: string;
      notes?: string;
    }>;
  };

  // Map to our types with IDs
  const storyCards: StoryCard[] = parsed.storyCards.map((card) => ({
    id: generateId(),
    type: card.type as StoryCard["type"],
    name: card.name,
    trigger: card.trigger,
    content: card.content,
    notes: card.notes ?? "",
    enabled: true,
  }));

  return {
    name: parsed.name,
    genre: parsed.genre,
    description: parsed.description,
    setting: parsed.setting,
    tags: parsed.tags,
    plot: {
      aiInstructions: parsed.plot.aiInstructions,
      plotEssentials: parsed.plot.plotEssentials,
      authorsNote: parsed.plot.authorsNote,
      storySummary: parsed.plot.storySummary ?? "",
      openingType: parsed.plot.openingType ?? "story",
      openingContent: parsed.plot.openingContent ?? "",
    },
    storyCards,
  };
}
