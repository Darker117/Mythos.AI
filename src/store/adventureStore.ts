import { create } from "zustand";
import type { Adventure, StoryCard, ChatMessage, PlotData } from "../types";
import { DEFAULT_PLOT } from "../types";
import {
  loadAllAdventures,
  insertAdventure,
  deleteAdventure as dbDeleteAdventure,
  updateAdventureRow,
  appendMessage,
  removeLastMessages,
  clearMessages,
  insertStoryCard,
  updateStoryCardRow,
  deleteStoryCard as dbDeleteStoryCard,
} from "../db/adventures";

interface AdventureState {
  adventures: Adventure[];
  activeAdventureId: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;

  createAdventure: (adventure: Omit<Adventure, "id" | "createdAt" | "updatedAt" | "history"> & { history?: ChatMessage[] }) => string;
  deleteAdventure: (id: string) => void;
  duplicateAdventure: (id: string) => string | null;
  setActiveAdventure: (id: string | null) => void;
  getActiveAdventure: () => Adventure | undefined;

  updateAdventure: (id: string, partial: Partial<Adventure>) => void;
  updateMemory: (id: string, memory: string) => void;
  updatePlot: (id: string, partial: Partial<PlotData>) => void;

  addMessage: (id: string, message: ChatMessage) => void;
  undoLastExchange: (id: string) => void;
  clearHistory: (id: string) => void;

  addStoryCard: (adventureId: string, card: StoryCard) => void;
  updateStoryCard: (adventureId: string, cardId: string, partial: Partial<StoryCard>) => void;
  removeStoryCard: (adventureId: string, cardId: string) => void;
  toggleStoryCard: (adventureId: string, cardId: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Adventure state is cached in zustand for synchronous reads, but SQLite is the
 * source of truth. Every mutation updates local state immediately (optimistic)
 * and queues an async write via src/db/adventures.ts. Call `hydrate()` once on
 * app boot to populate from disk.
 */
export const useAdventureStore = create<AdventureState>()((set, get) => ({
  adventures: [],
  activeAdventureId: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const adventures = await loadAllAdventures();
      // One-time migration from the old zustand-persist localStorage blob.
      if (adventures.length === 0) {
        const legacy = localStorage.getItem("mythos-adventures");
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            const list: Adventure[] = parsed?.state?.adventures ?? [];
            for (const a of list) insertAdventure(a);
            localStorage.removeItem("mythos-adventures");
            set({
              adventures: list.sort((a, b) => b.updatedAt - a.updatedAt),
              activeAdventureId: parsed?.state?.activeAdventureId ?? null,
              hydrated: true,
            });
            return;
          } catch {
            /* fall through */
          }
        }
      }
      set({ adventures, hydrated: true });
    } catch (err) {
      console.error("[adventureStore] hydrate failed:", err);
      set({ hydrated: true });
    }
  },

  createAdventure: (data) => {
    const id = generateId();
    const adventure: Adventure = {
      ...{ description: "", tags: [], plot: { ...DEFAULT_PLOT } },
      ...data,
      id,
      history: data.history ?? [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      adventures: [adventure, ...state.adventures],
      activeAdventureId: id,
    }));
    insertAdventure(adventure);
    return id;
  },

  deleteAdventure: (id) => {
    set((state) => ({
      adventures: state.adventures.filter((a) => a.id !== id),
      activeAdventureId: state.activeAdventureId === id ? null : state.activeAdventureId,
    }));
    dbDeleteAdventure(id);
  },

  duplicateAdventure: (id) => {
    const source = get().adventures.find((a) => a.id === id);
    if (!source) return null;
    const newId = generateId();
    const duplicate: Adventure = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      history: [],
      // regenerate card ids so they're unique per adventure
      storyCards: source.storyCards.map((c) => ({ ...c, id: generateId() })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ adventures: [duplicate, ...state.adventures] }));
    insertAdventure(duplicate);
    return newId;
  },

  setActiveAdventure: (id) => set({ activeAdventureId: id }),

  getActiveAdventure: () => {
    const { adventures, activeAdventureId } = get();
    return adventures.find((a) => a.id === activeAdventureId);
  },

  updateAdventure: (id, partial) => {
    let updated: Adventure | undefined;
    set((state) => ({
      adventures: state.adventures.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, ...partial, updatedAt: Date.now() };
        return updated;
      }),
    }));
    if (updated) updateAdventureRow(id, updated);
  },

  updateMemory: (id, memory) => {
    let updated: Adventure | undefined;
    set((state) => ({
      adventures: state.adventures.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, memory, updatedAt: Date.now() };
        return updated;
      }),
    }));
    if (updated) updateAdventureRow(id, updated);
  },

  updatePlot: (id, partial) => {
    let updated: Adventure | undefined;
    set((state) => ({
      adventures: state.adventures.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, plot: { ...(a.plot ?? DEFAULT_PLOT), ...partial }, updatedAt: Date.now() };
        return updated;
      }),
    }));
    if (updated) updateAdventureRow(id, updated);
  },

  addMessage: (id, message) => {
    let seq = 0;
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) => {
        if (a.id !== id) return a;
        seq = a.history.length;
        return { ...a, history: [...a.history, message], updatedAt };
      }),
    }));
    appendMessage(id, message, seq, updatedAt);
  },

  undoLastExchange: (id) => {
    let removed = 0;
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) => {
        if (a.id !== id) return a;
        const history = [...a.history];
        if (history.length > 0 && history[history.length - 1]!.role === "assistant") {
          history.pop();
          removed++;
        }
        if (history.length > 0 && history[history.length - 1]!.role === "user") {
          history.pop();
          removed++;
        }
        return { ...a, history, updatedAt };
      }),
    }));
    if (removed > 0) removeLastMessages(id, removed, updatedAt);
  },

  clearHistory: (id) => {
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) =>
        a.id === id ? { ...a, history: [], updatedAt } : a,
      ),
    }));
    clearMessages(id, updatedAt);
  },

  addStoryCard: (adventureId, card) => {
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) =>
        a.id === adventureId
          ? { ...a, storyCards: [...a.storyCards, card], updatedAt }
          : a,
      ),
    }));
    insertStoryCard(adventureId, card, updatedAt);
  },

  updateStoryCard: (adventureId, cardId, partial) => {
    let updatedCard: StoryCard | undefined;
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) =>
        a.id === adventureId
          ? {
              ...a,
              storyCards: a.storyCards.map((c) => {
                if (c.id !== cardId) return c;
                updatedCard = { ...c, ...partial };
                return updatedCard;
              }),
              updatedAt,
            }
          : a,
      ),
    }));
    if (updatedCard) updateStoryCardRow(cardId, updatedCard, adventureId, updatedAt);
  },

  removeStoryCard: (adventureId, cardId) => {
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) =>
        a.id === adventureId
          ? { ...a, storyCards: a.storyCards.filter((c) => c.id !== cardId), updatedAt }
          : a,
      ),
    }));
    dbDeleteStoryCard(cardId, adventureId, updatedAt);
  },

  toggleStoryCard: (adventureId, cardId) => {
    let toggled: StoryCard | undefined;
    const updatedAt = Date.now();
    set((state) => ({
      adventures: state.adventures.map((a) =>
        a.id === adventureId
          ? {
              ...a,
              storyCards: a.storyCards.map((c) => {
                if (c.id !== cardId) return c;
                toggled = { ...c, enabled: !c.enabled };
                return toggled;
              }),
              updatedAt,
            }
          : a,
      ),
    }));
    if (toggled) updateStoryCardRow(cardId, toggled, adventureId, updatedAt);
  },
}));
