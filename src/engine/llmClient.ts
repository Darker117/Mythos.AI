import OpenAI from "openai";
import type { LLMSettings } from "../types";

let clientInstance: OpenAI | null = null;
let lastEndpoint = "";
let lastApiKey = "";

function getClient(settings: LLMSettings): OpenAI {
  if (
    clientInstance &&
    lastEndpoint === settings.endpoint &&
    lastApiKey === settings.apiKey
  ) {
    return clientInstance;
  }
  clientInstance = new OpenAI({
    baseURL: settings.endpoint,
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true,
  });
  lastEndpoint = settings.endpoint;
  lastApiKey = settings.apiKey;
  return clientInstance;
}

export interface CompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateCompletion(
  messages: CompletionMessage[],
  settings: LLMSettings,
): Promise<string> {
  const client = getClient(settings);
  const response = await client.chat.completions.create({
    model: settings.model,
    messages,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
    top_p: settings.topP,
    frequency_penalty: settings.frequencyPenalty,
    presence_penalty: settings.presencePenalty,
    stream: false,
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function* generateCompletionStream(
  messages: CompletionMessage[],
  settings: LLMSettings,
): AsyncGenerator<string, void, unknown> {
  const client = getClient(settings);
  const stream = await client.chat.completions.create({
    model: settings.model,
    messages,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
    top_p: settings.topP,
    frequency_penalty: settings.frequencyPenalty,
    presence_penalty: settings.presencePenalty,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}

export async function testConnection(settings: LLMSettings): Promise<boolean> {
  try {
    const client = getClient(settings);
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}

export async function fetchModels(settings: LLMSettings): Promise<string[]> {
  try {
    const client = getClient(settings);
    const response = await client.models.list();
    const models: string[] = [];
    for await (const model of response) {
      models.push(model.id);
    }
    return models;
  } catch {
    return [];
  }
}
