import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Gamepad2,
  FileText,
  Layers,
  Cpu,
  Palette,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Adventure, StoryCard, ThemeName, TextStyle } from "../../types";
import { useAdventureStore } from "../../store/adventureStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useGameStore } from "../../store/gameStore";
import { fetchModels } from "../../engine/llmClient";
import { NeuInput, NeuTextarea, NeuButton } from "../neumorphic/Primitives";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface Props {
  adventure: Adventure;
}

const THEMES: { key: ThemeName; label: string; color: string }[] = [
  { key: "dark", label: "Default", color: "#7c5cfc" },
  { key: "orcish", label: "Orcish", color: "#ef4444" },
  { key: "atlantis", label: "Atlantis", color: "#06b6d4" },
  { key: "smores", label: "S'mores", color: "#f59e0b" },
  { key: "neon-pulse", label: "Neon Pulse", color: "#ff00ff" },
];

const TEXT_STYLES: { key: TextStyle; label: string }[] = [
  { key: "modern", label: "Modern" },
  { key: "classic", label: "Classic" },
  { key: "typewriter", label: "Typewriter" },
];

export default function SettingsSidebar({ adventure }: Props) {
  const {
    settingsPanelOpen,
    setSettingsPanelOpen,
    adventureTab,
    setAdventureTab,
    adventureSubTab,
    setAdventureSubTab,
    gameplaySubTab,
    setGameplaySubTab,
  } = useGameStore();

  const { updatePlot, addStoryCard, updateStoryCard, removeStoryCard, toggleStoryCard } =
    useAdventureStore();
  const { settings, setTheme, updateLLM, updateSettings } = useSettingsStore();

  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (settingsPanelOpen && gameplaySubTab === "models") {
      handleRefreshModels();
    }
  }, [settingsPanelOpen, gameplaySubTab]);

  async function handleRefreshModels() {
    setLoadingModels(true);
    const m = await fetchModels(settings.llm);
    setModels(m);
    setLoadingModels(false);
  }

  function handleAddCard() {
    addStoryCard(adventure.id, {
      id: generateId(),
      name: "",
      trigger: "",
      content: "",
      type: "lore",
      notes: "",
      enabled: true,
    });
  }

  if (!settingsPanelOpen) return null;

  const plot = adventure.plot ?? { aiInstructions: "", plotEssentials: "", authorsNote: "", storySummary: "", openingType: "story" as const, openingContent: "" };

  return (
    <div className="w-80 h-full border-l border-white/5 flex flex-col shrink-0 bg-[#1a1a1a]/90 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex gap-1">
          <button
            onClick={() => setAdventureTab("adventure")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              adventureTab === "adventure" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <BookOpen size={13} /> Adventure
          </button>
          <button
            onClick={() => setAdventureTab("gameplay")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              adventureTab === "gameplay" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Gamepad2 size={13} /> Gameplay
          </button>
        </div>
        <button
          onClick={() => setSettingsPanelOpen(false)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex px-4 pt-2 gap-1 border-b border-white/5 pb-2">
        {adventureTab === "adventure" ? (
          <>
            <button
              onClick={() => setAdventureSubTab("plot")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                adventureSubTab === "plot" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <FileText size={12} /> Plot
            </button>
            <button
              onClick={() => setAdventureSubTab("cards")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                adventureSubTab === "cards" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <Layers size={12} /> Cards
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setGameplaySubTab("models")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                gameplaySubTab === "models" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <Cpu size={12} /> AI Models
            </button>
            <button
              onClick={() => setGameplaySubTab("appearance")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                gameplaySubTab === "appearance" ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
            >
              <Palette size={12} /> Appearance
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── ADVENTURE > PLOT ── */}
        {adventureTab === "adventure" && adventureSubTab === "plot" && (
          <>
            <NeuTextarea
              label="AI Instructions"
              value={plot.aiInstructions}
              onChange={(e) => updatePlot(adventure.id, { aiInstructions: e.target.value })}
              rows={3}
              placeholder="Rules for the AI narrator..."
            />
            <NeuTextarea
              label="Plot Essentials"
              value={plot.plotEssentials}
              onChange={(e) => updatePlot(adventure.id, { plotEssentials: e.target.value })}
              rows={3}
              placeholder="Key facts to always remember..."
            />
            <NeuTextarea
              label="Author's Note"
              value={plot.authorsNote}
              onChange={(e) => updatePlot(adventure.id, { authorsNote: e.target.value })}
              rows={2}
              placeholder="Tone and style hints..."
            />
            <NeuTextarea
              label="Story Summary"
              value={plot.storySummary}
              onChange={(e) => updatePlot(adventure.id, { storySummary: e.target.value })}
              rows={2}
              placeholder="Running summary..."
            />
          </>
        )}

        {/* ── ADVENTURE > CARDS ── */}
        {adventureTab === "adventure" && adventureSubTab === "cards" && (
          <>
            <NeuButton size="sm" onClick={handleAddCard} className="w-full flex items-center justify-center gap-1">
              <Plus size={14} /> Add Card
            </NeuButton>
            {adventure.storyCards.length === 0 ? (
              <p className="text-center text-xs text-[var(--text-muted)] py-6">No story cards yet</p>
            ) : (
              adventure.storyCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  adventureId={adventure.id}
                  onUpdate={updateStoryCard}
                  onRemove={removeStoryCard}
                  onToggle={toggleStoryCard}
                />
              ))
            )}
          </>
        )}

        {/* ── GAMEPLAY > MODELS ── */}
        {adventureTab === "gameplay" && gameplaySubTab === "models" && (
          <>
            <NeuInput
              label="Endpoint"
              value={settings.llm.endpoint}
              onChange={(e) => updateLLM({ endpoint: e.target.value })}
              placeholder="http://localhost:1234/v1"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[var(--text-muted)]">Model</label>
                <button
                  onClick={handleRefreshModels}
                  className="text-xs flex items-center gap-1 text-[var(--accent)] cursor-pointer"
                >
                  <RefreshCw size={10} className={loadingModels ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              {models.length > 0 ? (
                <select
                  value={settings.llm.model}
                  onChange={(e) => updateLLM({ model: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-sm bg-[#1a1a1a] text-[var(--text-primary)] border border-white/5 outline-none cursor-pointer shadow-[inset_3px_3px_6px_#111,inset_-3px_-3px_6px_#2a2a2a]"
                >
                  <option value="default">Default</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <NeuInput
                  value={settings.llm.model}
                  onChange={(e) => updateLLM({ model: e.target.value })}
                  placeholder="Model name"
                />
              )}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-muted)]">Context Length</span>
                <span className="text-[var(--accent)]">{settings.llm.contextLength}</span>
              </div>
              <input type="range" min="1024" max="32768" step="512" value={settings.llm.contextLength}
                onChange={(e) => updateLLM({ contextLength: parseInt(e.target.value) })}
                className="w-full accent-[var(--accent)]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Memory Bank</span>
              <button onClick={() => updateSettings({ memoryBank: !settings.memoryBank })} className="cursor-pointer"
                style={{ color: settings.memoryBank ? "var(--success)" : "var(--text-muted)" }}>
                {settings.memoryBank ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Auto-Summarize</span>
              <button onClick={() => updateSettings({ autoSummarize: !settings.autoSummarize })} className="cursor-pointer"
                style={{ color: settings.autoSummarize ? "var(--success)" : "var(--text-muted)" }}>
                {settings.autoSummarize ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
            </div>
          </>
        )}

        {/* ── GAMEPLAY > APPEARANCE ── */}
        {adventureTab === "gameplay" && gameplaySubTab === "appearance" && (
          <>
            <div>
              <label className="block text-xs font-medium mb-2 text-[var(--text-muted)]">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      settings.theme === t.key ? "bg-white/10 border border-white/10" : "bg-[#1a1a1a] border border-white/5 hover:bg-white/5"
                    }`}
                    style={{ color: settings.theme === t.key ? t.color : "var(--text-secondary)" }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}60` }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 text-[var(--text-muted)]">Text Style</label>
              <div className="flex gap-2">
                {TEXT_STYLES.map((s) => (
                  <NeuButton
                    key={s.key}
                    size="sm"
                    active={settings.textStyle === s.key}
                    onClick={() => updateSettings({ textStyle: s.key })}
                  >
                    {s.label}
                  </NeuButton>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-muted)]">Response Length</span>
                <span className="text-[var(--accent)] capitalize">{settings.responseLength}</span>
              </div>
              <div className="flex gap-2">
                {(["short", "medium", "long"] as const).map((len) => (
                  <NeuButton key={len} size="sm" active={settings.responseLength === len}
                    onClick={() => updateSettings({ responseLength: len })}>
                    {len.charAt(0).toUpperCase() + len.slice(1)}
                  </NeuButton>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Story Card Item ──
function CardItem({
  card,
  adventureId,
  onUpdate,
  onRemove,
  onToggle,
}: {
  card: StoryCard;
  adventureId: string;
  onUpdate: (aid: string, cid: string, p: Partial<StoryCard>) => void;
  onRemove: (aid: string, cid: string) => void;
  onToggle: (aid: string, cid: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl p-3 bg-[#252525] border border-white/5" style={{ opacity: card.enabled ? 1 : 0.5 }}>
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="cursor-pointer text-[var(--text-muted)]">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-muted)] text-[var(--accent)] font-mono">
          {card.type}
        </span>
        <span className="flex-1 text-xs font-medium text-[var(--text-primary)] truncate">
          {card.name || card.trigger || "Untitled"}
        </span>
        <button onClick={() => onToggle(adventureId, card.id)} className="cursor-pointer"
          style={{ color: card.enabled ? "var(--success)" : "var(--text-muted)" }}>
          {card.enabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
        </button>
        <button onClick={() => onRemove(adventureId, card.id)}
          className="cursor-pointer text-[var(--text-muted)] hover:text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
      {open && (
        <div className="mt-2 space-y-2">
          <NeuInput value={card.name} onChange={(e) => onUpdate(adventureId, card.id, { name: e.target.value })} placeholder="Name" />
          <NeuInput value={card.trigger} onChange={(e) => onUpdate(adventureId, card.id, { trigger: e.target.value })} placeholder="Triggers (comma-sep)" />
          <NeuTextarea value={card.content} onChange={(e) => onUpdate(adventureId, card.id, { content: e.target.value })} rows={2} placeholder="Entry / description..." />
        </div>
      )}
    </div>
  );
}
