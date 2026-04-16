import type { Adventure, ChatMessage, StoryCard, PlotData, WorldState, StoryEvent } from "../types";
import { DEFAULT_PLOT, DEFAULT_WORLD_STATE } from "../types";
import { getDb, queueWrite } from "./index";

interface AdventureRow {
  id: string;
  name: string;
  genre: string;
  description: string;
  setting: string;
  system_prompt: string;
  memory: string;
  plot_json: string;
  tags_json: string;
  world_state_json: string;
  events_json: string;
  summarized_up_to: number;
  created_at: number;
  updated_at: number;
}

interface MessageRow {
  id: string;
  adventure_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  input_mode: string | null;
  timestamp: number;
  seq: number;
}

interface CardRow {
  id: string;
  adventure_id: string;
  trigger: string;
  content: string;
  type: StoryCard["type"];
  name: string;
  notes: string;
  enabled: number;
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToAdventure(
  row: AdventureRow,
  messages: ChatMessage[],
  cards: StoryCard[],
): Adventure {
  return {
    id: row.id,
    name: row.name,
    genre: row.genre,
    description: row.description,
    setting: row.setting,
    systemPrompt: row.system_prompt,
    memory: row.memory,
    plot: { ...DEFAULT_PLOT, ...parseJSON<Partial<PlotData>>(row.plot_json, {}) },
    storyCards: cards,
    history: messages,
    tags: parseJSON<string[]>(row.tags_json, []),
    worldState: { ...DEFAULT_WORLD_STATE, ...parseJSON<Partial<WorldState>>(row.world_state_json, {}) },
    events: parseJSON<StoryEvent[]>(row.events_json, []),
    summarizedUpTo: row.summarized_up_to ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Load every adventure (with messages + cards) from SQLite. */
export async function loadAllAdventures(): Promise<Adventure[]> {
  const db = await getDb();
  const advRows = await db.select<AdventureRow[]>(
    "SELECT * FROM adventures ORDER BY updated_at DESC",
  );
  if (advRows.length === 0) return [];

  const msgRows = await db.select<MessageRow[]>(
    "SELECT * FROM messages ORDER BY adventure_id, seq ASC",
  );
  const cardRows = await db.select<CardRow[]>(
    "SELECT * FROM story_cards ORDER BY adventure_id, rowid ASC",
  );

  const msgByAdv = new Map<string, ChatMessage[]>();
  for (const m of msgRows) {
    const list = msgByAdv.get(m.adventure_id) ?? [];
    list.push({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      inputMode: (m.input_mode ?? undefined) as ChatMessage["inputMode"],
    });
    msgByAdv.set(m.adventure_id, list);
  }

  const cardsByAdv = new Map<string, StoryCard[]>();
  for (const c of cardRows) {
    const list = cardsByAdv.get(c.adventure_id) ?? [];
    list.push({
      id: c.id,
      trigger: c.trigger,
      content: c.content,
      type: c.type,
      name: c.name,
      notes: c.notes,
      enabled: c.enabled === 1,
    });
    cardsByAdv.set(c.adventure_id, list);
  }

  return advRows.map((r) =>
    rowToAdventure(r, msgByAdv.get(r.id) ?? [], cardsByAdv.get(r.id) ?? []),
  );
}

/** Full insert of a new adventure — adventure row + messages + cards in a single transaction. */
export function insertAdventure(adv: Adventure): void {
  queueWrite(async (db) => {
    await db.execute(
      `INSERT INTO adventures (id, name, genre, description, setting, system_prompt, memory, plot_json, tags_json, world_state_json, events_json, summarized_up_to, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        adv.id,
        adv.name,
        adv.genre,
        adv.description,
        adv.setting,
        adv.systemPrompt,
        adv.memory,
        JSON.stringify(adv.plot),
        JSON.stringify(adv.tags),
        JSON.stringify(adv.worldState),
        JSON.stringify(adv.events),
        adv.summarizedUpTo,
        adv.createdAt,
        adv.updatedAt,
      ],
    );
    for (let i = 0; i < adv.history.length; i++) {
      const m = adv.history[i]!;
      await db.execute(
        `INSERT INTO messages (id, adventure_id, role, content, input_mode, timestamp, seq)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [m.id, adv.id, m.role, m.content, m.inputMode ?? null, m.timestamp, i],
      );
    }
    for (const c of adv.storyCards) {
      await db.execute(
        `INSERT INTO story_cards (id, adventure_id, trigger, content, type, name, notes, enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [c.id, adv.id, c.trigger, c.content, c.type, c.name, c.notes, c.enabled ? 1 : 0],
      );
    }
  });
}

export function deleteAdventure(id: string): void {
  queueWrite(async (db) => {
    // manual cascade — tauri-plugin-sql doesn't always enable FK pragma
    await db.execute("DELETE FROM messages WHERE adventure_id = $1", [id]);
    await db.execute("DELETE FROM story_cards WHERE adventure_id = $1", [id]);
    await db.execute("DELETE FROM adventures WHERE id = $1", [id]);
  });
}

/** Patch any subset of the adventure metadata columns. */
export function updateAdventureRow(id: string, adv: Adventure): void {
  queueWrite(async (db) => {
    await db.execute(
      `UPDATE adventures SET
        name = $1, genre = $2, description = $3, setting = $4,
        system_prompt = $5, memory = $6, plot_json = $7, tags_json = $8,
        world_state_json = $9, events_json = $10, summarized_up_to = $11,
        updated_at = $12
       WHERE id = $13`,
      [
        adv.name,
        adv.genre,
        adv.description,
        adv.setting,
        adv.systemPrompt,
        adv.memory,
        JSON.stringify(adv.plot),
        JSON.stringify(adv.tags),
        JSON.stringify(adv.worldState),
        JSON.stringify(adv.events),
        adv.summarizedUpTo,
        adv.updatedAt,
        id,
      ],
    );
  });
}

export function appendMessage(adventureId: string, message: ChatMessage, seq: number, updatedAt: number): void {
  queueWrite(async (db) => {
    await db.execute(
      `INSERT INTO messages (id, adventure_id, role, content, input_mode, timestamp, seq)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [message.id, adventureId, message.role, message.content, message.inputMode ?? null, message.timestamp, seq],
    );
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}

export function removeLastMessages(adventureId: string, count: number, updatedAt: number): void {
  if (count <= 0) return;
  queueWrite(async (db) => {
    await db.execute(
      `DELETE FROM messages WHERE id IN (
         SELECT id FROM messages WHERE adventure_id = $1 ORDER BY seq DESC LIMIT $2
       )`,
      [adventureId, count],
    );
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}

export function clearMessages(adventureId: string, updatedAt: number): void {
  queueWrite(async (db) => {
    await db.execute("DELETE FROM messages WHERE adventure_id = $1", [adventureId]);
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}

export function insertStoryCard(adventureId: string, card: StoryCard, updatedAt: number): void {
  queueWrite(async (db) => {
    await db.execute(
      `INSERT INTO story_cards (id, adventure_id, trigger, content, type, name, notes, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [card.id, adventureId, card.trigger, card.content, card.type, card.name, card.notes, card.enabled ? 1 : 0],
    );
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}

export function updateStoryCardRow(cardId: string, card: StoryCard, adventureId: string, updatedAt: number): void {
  queueWrite(async (db) => {
    await db.execute(
      `UPDATE story_cards SET trigger = $1, content = $2, type = $3, name = $4, notes = $5, enabled = $6
       WHERE id = $7`,
      [card.trigger, card.content, card.type, card.name, card.notes, card.enabled ? 1 : 0, cardId],
    );
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}

export function deleteStoryCard(cardId: string, adventureId: string, updatedAt: number): void {
  queueWrite(async (db) => {
    await db.execute("DELETE FROM story_cards WHERE id = $1", [cardId]);
    await db.execute("UPDATE adventures SET updated_at = $1 WHERE id = $2", [updatedAt, adventureId]);
  });
}
