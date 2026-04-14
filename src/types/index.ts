export type ThemeName = "dark" | "orcish" | "atlantis" | "smores" | "neon-pulse";
export type TextStyle = "modern" | "classic" | "typewriter";

export interface StoryCard {
  id: string;
  trigger: string;
  content: string;
  type: "character" | "location" | "item" | "lore" | "event" | "faction" | "class" | "race";
  name: string;
  notes: string;
  enabled: boolean;
}

export interface PlotData {
  aiInstructions: string;
  plotEssentials: string;
  authorsNote: string;
  storySummary: string;
  openingType: "story" | "choice" | "character";
  openingContent: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  inputMode?: "do" | "say" | "story" | "see";
}

export interface Adventure {
  id: string;
  name: string;
  genre: string;
  description: string;
  setting: string;
  systemPrompt: string;
  memory: string;
  plot: PlotData;
  storyCards: StoryCard[];
  history: ChatMessage[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface LLMSettings {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  contextLength: number;
}

export interface AppSettings {
  theme: ThemeName;
  textStyle: TextStyle;
  llm: LLMSettings;
  historyWindow: number;
  autoSave: boolean;
  streamResponses: boolean;
  fontSize: "small" | "medium" | "large";
  memoryBank: boolean;
  autoSummarize: boolean;
  responseLength: "short" | "medium" | "long";
}

export const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "Post-Apocalyptic",
  "Cyberpunk",
  "Steampunk",
  "Medieval",
  "Modern",
  "Supernatural",
  "Space Opera",
  "Western",
  "Custom",
] as const;

export type Genre = (typeof GENRES)[number];

export const SCENARIO_TEMPLATES = [
  { id: "random", label: "Random", icon: "Shuffle", color: "#7c5cfc" },
  { id: "empty", label: "Blank", icon: "FileText", color: "#666" },
  { id: "fantasy", label: "Fantasy", icon: "Sword", color: "#ef4444" },
  { id: "mystery", label: "Mystery", icon: "Search", color: "#f59e0b" },
  { id: "zombie", label: "Zombie", icon: "Skull", color: "#22c55e" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "Cpu", color: "#06b6d4" },
  { id: "apocalyptic", label: "Apocalyptic", icon: "Flame", color: "#f97316" },
] as const;

export const DEFAULT_PLOT: PlotData = {
  aiInstructions: "",
  plotEssentials: "",
  authorsNote: "",
  storySummary: "",
  openingType: "story",
  openingContent: "",
};

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  endpoint: "http://localhost:1234/v1",
  apiKey: "lm-studio",
  model: "default",
  temperature: 0.8,
  maxTokens: 1024,
  topP: 0.95,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  contextLength: 4096,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  textStyle: "modern",
  llm: { ...DEFAULT_LLM_SETTINGS },
  historyWindow: 20,
  autoSave: true,
  streamResponses: true,
  fontSize: "medium",
  memoryBank: true,
  autoSummarize: false,
  responseLength: "medium",
};
