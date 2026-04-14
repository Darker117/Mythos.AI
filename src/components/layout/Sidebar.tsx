import { useEffect, useState } from "react";
import {
  Home,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useGameStore, type View } from "../../store/gameStore";
import { useAdventureStore } from "../../store/adventureStore";
import { NeuButton } from "../neumorphic/Primitives";

const NAV_ITEMS: { view: View; icon: typeof Home; label: string }[] = [
  { view: "dashboard", icon: Home, label: "Home" },
  { view: "game", icon: Sparkles, label: "Play" },
  { view: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebarCollapsed, setSidebarCollapsed, openCreator } =
    useGameStore();
  const { adventures, setActiveAdventure } = useAdventureStore();
  const [showNoAdventurePopup, setShowNoAdventurePopup] = useState(false);

  function handleNavClick(view: View) {
    if (view === "game") {
      if (adventures.length > 0) {
        // Resume most recent adventure (sorted by updatedAt)
        const mostRecent = [...adventures].sort((a, b) => b.updatedAt - a.updatedAt)[0]!;
        setActiveAdventure(mostRecent.id);
        setView("game");
      } else {
        setShowNoAdventurePopup(true);
      }
    } else {
      setView(view);
    }
  }

  // Auto-collapse on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setSidebarCollapsed(e.matches);
    if (mq.matches) setSidebarCollapsed(true);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setSidebarCollapsed]);

  const w = sidebarCollapsed ? "w-20" : "w-72";

  return (
    <div
      className={`
        ${w} sidebar-transition h-full flex flex-col shrink-0
        backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg-strong)]
        border-r border-white/5
        shadow-[5px_5px_15px_rgba(0,0,0,0.4),-5px_-5px_15px_rgba(255,255,255,0.05)]
        ${sidebarCollapsed ? "rounded-none" : "rounded-r-3xl"}
        relative z-30
      `}
    >
      {/* Toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[var(--surface-raised)] border border-[var(--border-glow)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface-raised)] transition-colors z-40"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={12} className="text-white/60" />
        ) : (
          <ChevronLeft size={12} className="text-white/60" />
        )}
      </button>

      {/* Brand */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 overflow-hidden">
        <div
          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm accent-glow"
          style={{ backgroundColor: "var(--accent)" }}
        >
          M
        </div>
        {!sidebarCollapsed && (
          <span
            className="text-lg font-bold whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}
          >
            Mythos.AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.view;
          return (
            <NeuButton
              key={item.view}
              active={active}
              onClick={() => handleNavClick(item.view)}
              className={`w-full flex items-center gap-3 ${sidebarCollapsed ? "justify-center !px-0" : ""}`}
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NeuButton>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <NeuButton
          className={`w-full flex items-center gap-3 ${sidebarCollapsed ? "justify-center !px-0" : ""}`}
          onClick={() => {/* placeholder */}}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Log Out</span>}
        </NeuButton>
      </div>

      {/* No Adventure Popup */}
      {showNoAdventurePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNoAdventurePopup(false)}
          />
          <div className="relative neu-glass rounded-2xl p-6 max-w-sm mx-4 text-center">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
              No Adventures Yet
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              You don't have any adventures. Would you like to begin a new story?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowNoAdventurePopup(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowNoAdventurePopup(false);
                  openCreator();
                }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:brightness-110 accent-glow"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
