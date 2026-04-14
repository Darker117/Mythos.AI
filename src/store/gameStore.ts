import { create } from "zustand";

export type View = "dashboard" | "creator" | "game" | "settings";
export type InputMode = "do" | "say" | "story" | "see";
export type AdventureTab = "adventure" | "gameplay";
export type AdventureSubTab = "plot" | "cards";
export type GameplaySubTab = "models" | "appearance";

interface GameState {
  currentView: View;
  inputMode: InputMode;
  isGenerating: boolean;
  streamingText: string;
  error: string | null;

  // Sidebar (nav dock)
  sidebarCollapsed: boolean;

  // Adventure settings panel (right side in game view)
  settingsPanelOpen: boolean;
  adventureTab: AdventureTab;
  adventureSubTab: AdventureSubTab;
  gameplaySubTab: GameplaySubTab;

  // Scenario creator modal
  creatorOpen: boolean;
  editingAdventureId: string | null;

  setView: (view: View) => void;
  setInputMode: (mode: InputMode) => void;
  setGenerating: (generating: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  setError: (error: string | null) => void;

  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  toggleSettingsPanel: () => void;
  setSettingsPanelOpen: (open: boolean) => void;
  setAdventureTab: (tab: AdventureTab) => void;
  setAdventureSubTab: (tab: AdventureSubTab) => void;
  setGameplaySubTab: (tab: GameplaySubTab) => void;

  openCreator: (editId?: string | null) => void;
  closeCreator: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  currentView: "dashboard",
  inputMode: "do",
  isGenerating: false,
  streamingText: "",
  error: null,
  sidebarCollapsed: false,
  settingsPanelOpen: false,
  adventureTab: "adventure",
  adventureSubTab: "plot",
  gameplaySubTab: "models",
  creatorOpen: false,
  editingAdventureId: null,

  setView: (currentView) => set({ currentView }),
  setInputMode: (inputMode) => set({ inputMode }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setStreamingText: (streamingText) => set({ streamingText }),
  appendStreamingText: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),
  setError: (error) => set({ error }),

  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  toggleSettingsPanel: () =>
    set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen })),
  setSettingsPanelOpen: (settingsPanelOpen) => set({ settingsPanelOpen }),
  setAdventureTab: (adventureTab) => set({ adventureTab }),
  setAdventureSubTab: (adventureSubTab) => set({ adventureSubTab }),
  setGameplaySubTab: (gameplaySubTab) => set({ gameplaySubTab }),

  openCreator: (editId = null) =>
    set({ creatorOpen: true, editingAdventureId: editId }),
  closeCreator: () =>
    set({ creatorOpen: false, editingAdventureId: null }),
}));
