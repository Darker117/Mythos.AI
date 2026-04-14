import { useEffect } from "react";
import {
  Home,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useGameStore, type View } from "../../store/gameStore";
import { NeuButton } from "../neumorphic/Primitives";

const NAV_ITEMS: { view: View; icon: typeof Home; label: string }[] = [
  { view: "dashboard", icon: Home, label: "Home" },
  { view: "game", icon: Sparkles, label: "Play" },
  { view: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebarCollapsed, setSidebarCollapsed } =
    useGameStore();

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
        backdrop-blur-md bg-[#212121]/80
        border-r border-white/5
        shadow-[5px_5px_15px_rgba(0,0,0,0.4),-5px_-5px_15px_rgba(255,255,255,0.05)]
        ${sidebarCollapsed ? "rounded-none" : "rounded-r-3xl"}
        relative z-30
      `}
    >
      {/* Toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors z-40"
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
              onClick={() => setView(item.view)}
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
    </div>
  );
}
