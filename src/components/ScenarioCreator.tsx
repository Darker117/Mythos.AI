import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Play,
  ToggleLeft,
  ToggleRight,
  Shuffle,
  FileText,
  Sword,
  Search,
  Skull,
  Cpu,
  Flame,
} from "lucide-react";
import { GENRES, SCENARIO_TEMPLATES, DEFAULT_PLOT, type StoryCard, type PlotData } from "../types";
import { useAdventureStore } from "../store/adventureStore";
import { useSettingsStore } from "../store/settingsStore";
import { useGameStore } from "../store/gameStore";
import { NeuInput, NeuTextarea, NeuButton, NeuCard } from "./neumorphic/Primitives";
import { generateRandomScenario } from "../engine/scenarioGenerator";
import { Loader2 } from "lucide-react";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const TEMPLATE_ICONS: Record<string, typeof Sword> = {
  Shuffle, FileText, Sword, Search, Skull, Cpu, Flame,
};

type CreatorTab = "details" | "plot" | "cards";

export default function ScenarioCreator() {
  const { adventures, createAdventure, updateAdventure } = useAdventureStore();
  const { settings } = useSettingsStore();
  const { creatorOpen, closeCreator, editingAdventureId, setView } = useGameStore();

  const [step, setStep] = useState<"template" | "editor" | "generating">("template");
  const [tab, setTab] = useState<CreatorTab>("details");
  const [genError, setGenError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [setting, setSetting] = useState("");
  const [tags, setTags] = useState("");
  const [plot, setPlot] = useState<PlotData>({ ...DEFAULT_PLOT });
  const [cards, setCards] = useState<StoryCard[]>([]);

  // Load existing adventure for editing
  useEffect(() => {
    if (editingAdventureId) {
      const adv = adventures.find((a) => a.id === editingAdventureId);
      if (adv) {
        setName(adv.name);
        setDescription(adv.description);
        setGenre(adv.genre);
        setSetting(adv.setting);
        setTags(adv.tags.join(", "));
        setPlot(adv.plot ?? { ...DEFAULT_PLOT });
        setCards([...adv.storyCards]);
        setStep("editor");
      }
    } else {
      setStep("template");
      resetForm();
    }
  }, [editingAdventureId, adventures]);

  function resetForm() {
    setName("");
    setDescription("");
    setGenre("Fantasy");
    setSetting("");
    setTags("");
    setPlot({ ...DEFAULT_PLOT });
    setCards([]);
    setTab("details");
  }

  async function handleSelectTemplate(id: string) {
    if (id === "random") {
      // AI-powered generation
      setStep("generating");
      setGenError(null);
      try {
        const scenario = await generateRandomScenario(settings.llm);
        setName(scenario.name);
        setDescription(scenario.description);
        setGenre(scenario.genre);
        setSetting(scenario.setting);
        setTags(scenario.tags.join(", "));
        setPlot(scenario.plot);
        setCards(scenario.storyCards);
        setStep("editor");
      } catch (err) {
        setGenError(err instanceof Error ? err.message : "Failed to generate scenario. Check your LM Studio connection.");
        setStep("template");
      }
      return;
    }

    if (id === "empty") {
      setGenre("Custom");
    } else {
      setGenre(id.charAt(0).toUpperCase() + id.slice(1));
    }
    setStep("editor");
  }

  function handleSave() {
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      genre,
      description: description.trim(),
      setting: setting.trim(),
      systemPrompt: plot.aiInstructions,
      memory: plot.plotEssentials,
      plot,
      storyCards: cards.filter((c) => c.name.trim() || c.trigger.trim()),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editingAdventureId) {
      updateAdventure(editingAdventureId, data);
      closeCreator();
    } else {
      createAdventure(data);
      closeCreator();
      setView("game");
    }
  }

  function addCard() {
    setCards((prev) => [
      ...prev,
      {
        id: generateId(),
        name: "",
        trigger: "",
        content: "",
        type: "lore",
        notes: "",
        enabled: true,
      },
    ]);
  }

  function updateCard(id: string, partial: Partial<StoryCard>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  if (!creatorOpen) return null;

  const tabs: { key: CreatorTab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "plot", label: "Plot" },
    { key: "cards", label: "Story Cards" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCreator}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] mx-4 flex flex-col neu-glass rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {editingAdventureId ? "Edit Adventure" : "Create Adventure"}
          </h2>
          <button
            onClick={closeCreator}
            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "generating" ? (
            /* ── Generating with AI ── */
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <Loader2 size={40} className="animate-spin mb-4" style={{ color: "var(--accent)" }} />
              <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">Crafting your adventure...</p>
              <p className="text-sm text-[var(--text-muted)] text-center">
                The AI is generating a unique scenario with characters, locations, factions, and lore
              </p>
            </div>
          ) : step === "template" ? (
            /* ── Template Selection ── */
            <div className="p-6">
              {genError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
                  {genError}
                </div>
              )}
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Choose a template to get started
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {SCENARIO_TEMPLATES.map((tmpl) => {
                  const Icon = TEMPLATE_ICONS[tmpl.icon] ?? FileText;
                  return (
                    <NeuCard
                      key={tmpl.id}
                      clickable
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className="p-4 flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: tmpl.color + "22", color: tmpl.color }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {tmpl.label}
                      </span>
                    </NeuCard>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Editor ── */
            <div>
              {/* Tab bar */}
              <div className="flex gap-1 px-6 pt-4">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
                      tab === t.key
                        ? "bg-white/10 text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* ── DETAILS TAB ── */}
                {tab === "details" && (
                  <>
                    <NeuInput
                      label="Title *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="The Shadow of Eldoria"
                    />
                    <NeuTextarea
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="A brief description of your adventure..."
                    />
                    <div>
                      <label className="block text-xs font-medium mb-2 text-[var(--text-muted)]">
                        Genre
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GENRES.map((g) => (
                          <NeuButton
                            key={g}
                            size="sm"
                            active={genre === g}
                            onClick={() => setGenre(g)}
                          >
                            {g}
                          </NeuButton>
                        ))}
                      </div>
                    </div>
                    <NeuInput
                      label="Tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="dark, epic, magic (comma-separated)"
                    />
                  </>
                )}

                {/* ── PLOT TAB ── */}
                {tab === "plot" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-[var(--text-muted)]">
                        Opening Type
                      </label>
                      <div className="flex gap-2">
                        {(["story", "choice", "character"] as const).map((t) => (
                          <NeuButton
                            key={t}
                            size="sm"
                            active={plot.openingType === t}
                            onClick={() => setPlot((p) => ({ ...p, openingType: t }))}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </NeuButton>
                        ))}
                      </div>
                    </div>
                    <NeuTextarea
                      label="Opening Content"
                      value={plot.openingContent}
                      onChange={(e) => setPlot((p) => ({ ...p, openingContent: e.target.value }))}
                      rows={3}
                      placeholder="How your adventure begins..."
                    />
                    <NeuTextarea
                      label="AI Instructions"
                      value={plot.aiInstructions}
                      onChange={(e) => setPlot((p) => ({ ...p, aiInstructions: e.target.value }))}
                      rows={3}
                      placeholder="Special rules for the AI narrator..."
                    />
                    <NeuTextarea
                      label="Plot Essentials"
                      value={plot.plotEssentials}
                      onChange={(e) => setPlot((p) => ({ ...p, plotEssentials: e.target.value }))}
                      rows={3}
                      placeholder="Key facts and plot points the AI must remember..."
                    />
                    <NeuTextarea
                      label="Author's Note"
                      value={plot.authorsNote}
                      onChange={(e) => setPlot((p) => ({ ...p, authorsNote: e.target.value }))}
                      rows={2}
                      placeholder="Tone and style hints..."
                    />
                    <NeuTextarea
                      label="Story Summary"
                      value={plot.storySummary}
                      onChange={(e) => setPlot((p) => ({ ...p, storySummary: e.target.value }))}
                      rows={2}
                      placeholder="Running summary of the story so far..."
                    />
                  </>
                )}

                {/* ── STORY CARDS TAB ── */}
                {tab === "cards" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {cards.length} card{cards.length !== 1 ? "s" : ""}
                      </span>
                      <NeuButton size="sm" onClick={addCard}>
                        <span className="flex items-center gap-1">
                          <Plus size={14} /> Add Card
                        </span>
                      </NeuButton>
                    </div>

                    {cards.length === 0 ? (
                      <div className="text-center py-10 text-[var(--text-muted)] text-sm">
                        <p>Story cards inject context when trigger words appear</p>
                        <p className="mt-1 text-xs">Add characters, locations, items, or lore</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cards.map((card) => (
                          <NeuCard key={card.id} className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <select
                                value={card.type}
                                onChange={(e) =>
                                  updateCard(card.id, { type: e.target.value as StoryCard["type"] })
                                }
                                className="text-xs rounded-lg px-2 py-1 bg-[var(--background)] text-[var(--text-secondary)] border border-[var(--border)] outline-none cursor-pointer"
                              >
                                <option value="character">Character</option>
                                <option value="location">Location</option>
                                <option value="item">Item</option>
                                <option value="lore">Lore</option>
                                <option value="event">Event</option>
                                <option value="faction">Faction</option>
                                <option value="class">Class</option>
                                <option value="race">Race</option>
                              </select>
                              <div className="flex-1" />
                              <button
                                onClick={() =>
                                  updateCard(card.id, { enabled: !card.enabled })
                                }
                                className="cursor-pointer"
                                style={{
                                  color: card.enabled ? "var(--success)" : "var(--text-muted)",
                                }}
                              >
                                {card.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                              </button>
                              <button
                                onClick={() => removeCard(card.id)}
                                className="cursor-pointer text-[var(--text-muted)] hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <NeuInput
                                value={card.name}
                                onChange={(e) => updateCard(card.id, { name: e.target.value })}
                                placeholder="Card name"
                              />
                              <NeuInput
                                value={card.trigger}
                                onChange={(e) => updateCard(card.id, { trigger: e.target.value })}
                                placeholder="Triggers (comma-sep)"
                              />
                            </div>
                            <NeuTextarea
                              value={card.content}
                              onChange={(e) => updateCard(card.id, { content: e.target.value })}
                              rows={2}
                              placeholder="Card description / entry..."
                            />
                          </NeuCard>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "editor" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <button
              onClick={() => setStep("template")}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
            >
              Back to templates
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:brightness-110 accent-glow disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Play size={16} />
              {editingAdventureId ? "Save Changes" : "Begin Adventure"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
