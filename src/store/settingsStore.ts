import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, ThemeName, LLMSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

interface SettingsState {
  settings: AppSettings;
  setTheme: (theme: ThemeName) => void;
  updateLLM: (partial: Partial<LLMSettings>) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },

      setTheme: (theme) =>
        set((state) => {
          document.documentElement.setAttribute("data-theme", theme);
          return { settings: { ...state.settings, theme } };
        }),

      updateLLM: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            llm: { ...state.settings.llm, ...partial },
          },
        })),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSettings: () => {
        document.documentElement.setAttribute(
          "data-theme",
          DEFAULT_SETTINGS.theme,
        );
        set({ settings: { ...DEFAULT_SETTINGS } });
      },
    }),
    {
      name: "mythos-settings",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute(
            "data-theme",
            state.settings.theme,
          );
        }
      },
    },
  ),
);
