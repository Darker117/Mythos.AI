import { create } from "zustand";
import type { AppSettings, ThemeName, LLMSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { kvGet, kvSet } from "../db/kv";

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemeName) => void;
  updateLLM: (partial: Partial<LLMSettings>) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SETTINGS_KEY = "settings";

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Settings live in the `kv` SQLite table as a single JSON blob. The entire
 * object is small enough that rewriting it on every change is effectively free.
 */
export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const stored = await kvGet<AppSettings>(SETTINGS_KEY);
      if (stored) {
        const merged: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...stored,
          llm: { ...DEFAULT_SETTINGS.llm, ...(stored.llm ?? {}) },
        };
        applyTheme(merged.theme);
        set({ settings: merged, hydrated: true });
        return;
      }
      // One-time migration from legacy zustand-persist localStorage blob.
      const legacy = localStorage.getItem("mythos-settings");
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          const legacySettings: AppSettings | undefined = parsed?.state?.settings;
          if (legacySettings) {
            const merged: AppSettings = {
              ...DEFAULT_SETTINGS,
              ...legacySettings,
              llm: { ...DEFAULT_SETTINGS.llm, ...(legacySettings.llm ?? {}) },
            };
            kvSet(SETTINGS_KEY, merged);
            localStorage.removeItem("mythos-settings");
            applyTheme(merged.theme);
            set({ settings: merged, hydrated: true });
            return;
          }
        } catch {
          /* ignore */
        }
      }
      applyTheme(DEFAULT_SETTINGS.theme);
      set({ hydrated: true });
    } catch (err) {
      console.error("[settingsStore] hydrate failed:", err);
      set({ hydrated: true });
    }
  },

  setTheme: (theme) => {
    applyTheme(theme);
    const next = { ...get().settings, theme };
    set({ settings: next });
    kvSet(SETTINGS_KEY, next);
  },

  updateLLM: (partial) => {
    const next: AppSettings = {
      ...get().settings,
      llm: { ...get().settings.llm, ...partial },
    };
    set({ settings: next });
    kvSet(SETTINGS_KEY, next);
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    set({ settings: next });
    kvSet(SETTINGS_KEY, next);
  },

  resetSettings: () => {
    applyTheme(DEFAULT_SETTINGS.theme);
    set({ settings: { ...DEFAULT_SETTINGS } });
    kvSet(SETTINGS_KEY, DEFAULT_SETTINGS);
  },
}));
