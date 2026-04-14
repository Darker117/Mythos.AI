import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Adventure, StoryCard, ChatMessage, PlotData } from "../types";
import { DEFAULT_PLOT } from "../types";

interface AdventureState {
  adventures: Adventure[];
  activeAdventureId: string | null;

  // Session management
  createAdventure: (adventure: Omit<Adventure, "id" | "createdAt" | "updatedAt" | "history"> & { history?: ChatMessage[] }) => string;
  deleteAdventure: (id: string) => void;
  duplicateAdventure: (id: string) => string | null;
  setActiveAdventure: (id: string | null) => void;
  getActiveAdventure: () => Adventure | undefined;

  // Adventure updates
  updateAdventure: (id: string, partial: Partial<Adventure>) => void;
  updateMemory: (id: string, memory: string) => void;
  updatePlot: (id: string, partial: Partial<PlotData>) => void;

  // History management
  addMessage: (id: string, message: ChatMessage) => void;
  undoLastExchange: (id: string) => void;
  clearHistory: (id: string) => void;

  // Story card management
  addStoryCard: (adventureId: string, card: StoryCard) => void;
  updateStoryCard: (adventureId: string, cardId: string, partial: Partial<StoryCard>) => void;
  removeStoryCard: (adventureId: string, cardId: string) => void;
  toggleStoryCard: (adventureId: string, cardId: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useAdventureStore = create<AdventureState>()(
  persist(
    (set, get) => ({
      adventures: [],
      activeAdventureId: null,

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
        return id;
      },

      deleteAdventure: (id) =>
        set((state) => ({
          adventures: state.adventures.filter((a) => a.id !== id),
          activeAdventureId:
            state.activeAdventureId === id ? null : state.activeAdventureId,
        })),

      duplicateAdventure: (id) => {
        const source = get().adventures.find((a) => a.id === id);
        if (!source) return null;
        const newId = generateId();
        const duplicate: Adventure = {
          ...source,
          id: newId,
          name: `${source.name} (Copy)`,
          history: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          adventures: [duplicate, ...state.adventures],
        }));
        return newId;
      },

      setActiveAdventure: (id) => set({ activeAdventureId: id }),

      getActiveAdventure: () => {
        const { adventures, activeAdventureId } = get();
        return adventures.find((a) => a.id === activeAdventureId);
      },

      updateAdventure: (id, partial) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === id ? { ...a, ...partial, updatedAt: Date.now() } : a,
          ),
        })),

      updateMemory: (id, memory) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === id ? { ...a, memory, updatedAt: Date.now() } : a,
          ),
        })),

      updatePlot: (id, partial) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === id
              ? { ...a, plot: { ...(a.plot ?? DEFAULT_PLOT), ...partial }, updatedAt: Date.now() }
              : a,
          ),
        })),

      addMessage: (id, message) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === id
              ? { ...a, history: [...a.history, message], updatedAt: Date.now() }
              : a,
          ),
        })),

      undoLastExchange: (id) =>
        set((state) => ({
          adventures: state.adventures.map((a) => {
            if (a.id !== id) return a;
            const history = [...a.history];
            // Remove last assistant message, then last user message
            if (history.length > 0 && history[history.length - 1]!.role === "assistant") {
              history.pop();
            }
            if (history.length > 0 && history[history.length - 1]!.role === "user") {
              history.pop();
            }
            return { ...a, history, updatedAt: Date.now() };
          }),
        })),

      clearHistory: (id) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === id ? { ...a, history: [], updatedAt: Date.now() } : a,
          ),
        })),

      addStoryCard: (adventureId, card) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === adventureId
              ? { ...a, storyCards: [...a.storyCards, card], updatedAt: Date.now() }
              : a,
          ),
        })),

      updateStoryCard: (adventureId, cardId, partial) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === adventureId
              ? {
                  ...a,
                  storyCards: a.storyCards.map((c) =>
                    c.id === cardId ? { ...c, ...partial } : c,
                  ),
                  updatedAt: Date.now(),
                }
              : a,
          ),
        })),

      removeStoryCard: (adventureId, cardId) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === adventureId
              ? {
                  ...a,
                  storyCards: a.storyCards.filter((c) => c.id !== cardId),
                  updatedAt: Date.now(),
                }
              : a,
          ),
        })),

      toggleStoryCard: (adventureId, cardId) =>
        set((state) => ({
          adventures: state.adventures.map((a) =>
            a.id === adventureId
              ? {
                  ...a,
                  storyCards: a.storyCards.map((c) =>
                    c.id === cardId ? { ...c, enabled: !c.enabled } : c,
                  ),
                  updatedAt: Date.now(),
                }
              : a,
          ),
        })),
    }),
    {
      name: "mythos-adventures",
    },
  ),
);
