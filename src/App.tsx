import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import { useGameStore } from "./store/gameStore";
import BackgroundGradient from "./components/BackgroundGradient";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/Dashboard";
import ScenarioCreator from "./components/ScenarioCreator";
import GameView from "./components/GameView";
import SettingsPanel from "./components/SettingsPanel";

export default function App() {
  const { settings } = useSettingsStore();
  const { currentView } = useGameStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const sizes = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[settings.fontSize];
  }, [settings.fontSize]);

  const isGameView = currentView === "game";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121]">
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
