import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import { useGameStore } from "./store/gameStore";
import { useAdventureStore } from "./store/adventureStore";
import BackgroundGradient from "./components/BackgroundGradient";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/Dashboard";
import ScenarioCreator from "./components/ScenarioCreator";
import GameView from "./components/GameView";
import SettingsPanel from "./components/SettingsPanel";

export default function App() {
  const { settings, hydrated: settingsReady, hydrate: hydrateSettings } = useSettingsStore();
  const { hydrated: adventuresReady, hydrate: hydrateAdventures } = useAdventureStore();
  const { currentView } = useGameStore();

  // Load from SQLite once on boot.
  useEffect(() => {
    hydrateSettings();
    hydrateAdventures();
  }, [hydrateSettings, hydrateAdventures]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const sizes = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  const ready = settingsReady && adventuresReady;
  const isGameView = currentView === "game";

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-transparent">
        <BackgroundGradient />
        <div className="text-sm text-[var(--text-muted)] animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      <BackgroundGradient />

      {/* Sidebar — hidden during game view for immersion */}
      {!isGameView && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 min-w-0 h-full overflow-hidden">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "game" && <GameView />}
        {currentView === "settings" && <SettingsPanel />}
      </main>

      {/* Scenario creator — modal overlay */}
      <ScenarioCreator />
    </div>
  );
}
