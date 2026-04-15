import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Cpu,
  Palette,
  ToggleLeft,
  ToggleRight,
  Check,
  Save,
} from "lucide-react";
import { useSettingsStore } from "../store/settingsStore";
import { useGameStore } from "../store/gameStore";
import { testConnection, fetchModels } from "../engine/llmClient";
import type { ThemeName, TextStyle } from "../types";
import { NeuCard, NeuButton, NeuInput } from "./neumorphic/Primitives";

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

type SettingsTab = "models" | "appearance";

export default function SettingsPanel() {
  const { settings, setTheme, updateLLM, updateSettings, resetSettings } = useSettingsStore();
  const { setView } = useGameStore();

  const [tab, setTab] = useState<SettingsTab>("models");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "connected" | "failed">("idle");
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [endpointDraft, setEndpointDraft] = useState(settings.llm.endpoint);
  const [apiKeyDraft, setApiKeyDraft] = useState(settings.llm.apiKey);
  const [endpointSaved, setEndpointSaved] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const endpointDirty = endpointDraft !== settings.llm.endpoint;
  const apiKeyDirty = apiKeyDraft !== settings.llm.apiKey;

  function handleSaveEndpoint() {
    updateLLM({ endpoint: endpointDraft });
    setEndpointSaved(true);
    setTimeout(() => setEndpointSaved(false), 2000);
  }

  function handleSaveApiKey() {
    updateLLM({ apiKey: apiKeyDraft });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  }

  useEffect(() => {
    handleTest();
  }, []);

  async function handleTest() {
    setConnectionStatus("testing");
    const ok = await testConnection(settings.llm);
    setConnectionStatus(ok ? "connected" : "failed");
    if (ok) {
      setLoadingModels(true);
      setModels(await fetchModels(settings.llm));
      setLoadingModels(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setView("dashboard")} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <NeuButton active={tab === "models"} onClick={() => setTab("models")} className="flex items-center gap-2">
            <Cpu size={15} /> AI Models
          </NeuButton>
          <NeuButton active={tab === "appearance"} onClick={() => setTab("appearance")} className="flex items-center gap-2">
            <Palette size={15} /> Appearance
          </NeuButton>
        </div>

        {/* ── AI MODELS ── */}
        {tab === "models" && (
          <div className="space-y-6">
            <NeuCard glass className="p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Connection</h3>
              <div>
                <NeuInput label="Endpoint URL" value={endpointDraft}
                  onChange={(e) => setEndpointDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && endpointDirty) handleSaveEndpoint(); }}
                  placeholder="http://localhost:1234/v1" />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleSaveEndpoint} disabled={!endpointDirty}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      endpointDirty
                        ? "bg-[var(--accent-muted)] text-[var(--accent)] cursor-pointer hover:brightness-110"
                        : "bg-white/5 text-[var(--text-muted)] cursor-not-allowed opacity-60"
                    }`}>
                    <Save size={12} /> Save
                  </button>
                  {endpointSaved && (
                    <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                      <Check size={12} /> Saved
                    </span>
                  )}
                  {endpointDirty && !endpointSaved && (
                    <span className="text-xs text-[var(--text-muted)]">Unsaved changes</span>
                  )}
                </div>
              </div>

              <div>
                <NeuInput label="API Key" type="password" value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && apiKeyDirty) handleSaveApiKey(); }}
                  placeholder="lm-studio" />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleSaveApiKey} disabled={!apiKeyDirty}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      apiKeyDirty
                        ? "bg-[var(--accent-muted)] text-[var(--accent)] cursor-pointer hover:brightness-110"
                        : "bg-white/5 text-[var(--text-muted)] cursor-not-allowed opacity-60"
                    }`}>
                    <Save size={12} /> Save
                  </button>
                  {apiKeySaved && (
                    <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                      <Check size={12} /> Saved
                    </span>
                  )}
                  {apiKeyDirty && !apiKeySaved && (
                    <span className="text-xs text-[var(--text-muted)]">Unsaved changes</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-[var(--text-muted)]">Model</label>
                  <button onClick={async () => { setLoadingModels(true); setModels(await fetchModels(settings.llm)); setLoadingModels(false); }}
                    className="text-xs flex items-center gap-1 text-[var(--accent)] cursor-pointer">
                    <RefreshCw size={10} className={loadingModels ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>
                {models.length > 0 ? (
                  <select value={settings.llm.model} onChange={(e) => updateLLM({ model: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)] outline-none cursor-pointer shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]">
                    <option value="default">Default</option>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <NeuInput value={settings.llm.model} onChange={(e) => updateLLM({ model: e.target.value })} placeholder="Model name" />
                )}
              </div>

              <button onClick={handleTest} disabled={connectionStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer bg-[var(--accent-muted)] text-[var(--accent)] transition-colors">
                {connectionStatus === "testing" ? <RefreshCw size={13} className="animate-spin" /> :
                  connectionStatus === "connected" ? <Wifi size={13} /> :
                  connectionStatus === "failed" ? <WifiOff size={13} /> : <Wifi size={13} />}
                {connectionStatus === "testing" ? "Testing..." :
                  connectionStatus === "connected" ? "Connected" :
                  connectionStatus === "failed" ? "Failed — Retry" : "Test Connection"}
              </button>
            </NeuCard>

            <NeuCard glass className="p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Generation</h3>
              {([
                { label: "Temperature", key: "temperature" as const, min: 0, max: 2, step: 0.05, fmt: (v: number) => v.toFixed(2) },
                { label: "Max Tokens", key: "maxTokens" as const, min: 128, max: 4096, step: 64, fmt: (v: number) => String(v) },
                { label: "Context Length", key: "contextLength" as const, min: 1024, max: 32768, step: 512, fmt: (v: number) => String(v) },
                { label: "Top P", key: "topP" as const, min: 0, max: 1, step: 0.05, fmt: (v: number) => v.toFixed(2) },
              ]).map(({ label, key, min, max, step, fmt }) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="text-[var(--accent)]">{fmt(settings.llm[key])}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={settings.llm[key]}
                    onChange={(e) => updateLLM({ [key]: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--accent)]" />
                </div>
              ))}

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Stream Responses</span>
                <button onClick={() => updateSettings({ streamResponses: !settings.streamResponses })} className="cursor-pointer"
                  style={{ color: settings.streamResponses ? "var(--success)" : "var(--text-muted)" }}>
                  {settings.streamResponses ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Memory Bank</span>
                <button onClick={() => updateSettings({ memoryBank: !settings.memoryBank })} className="cursor-pointer"
                  style={{ color: settings.memoryBank ? "var(--success)" : "var(--text-muted)" }}>
                  {settings.memoryBank ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Auto-Summarize</span>
                <button onClick={() => updateSettings({ autoSummarize: !settings.autoSummarize })} className="cursor-pointer"
                  style={{ color: settings.autoSummarize ? "var(--success)" : "var(--text-muted)" }}>
                  {settings.autoSummarize ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
            </NeuCard>
          </div>
        )}

        {/* ── APPEARANCE ── */}
        {tab === "appearance" && (
          <div className="space-y-6">
            <NeuCard glass className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <button key={t.key} onClick={() => setTheme(t.key)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer ${
                      settings.theme === t.key ? "bg-white/10 border-2 border-white/10" : "bg-[var(--surface)] border-2 border-transparent hover:bg-white/5"
                    }`}>
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: t.color, boxShadow: `0 0 12px ${t.color}50` }} />
                    <span className="text-sm font-medium" style={{ color: settings.theme === t.key ? t.color : "var(--text-secondary)" }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </NeuCard>

            <NeuCard glass className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Text Style</h3>
              <div className="flex gap-2">
                {TEXT_STYLES.map((s) => (
                  <NeuButton key={s.key} active={settings.textStyle === s.key} onClick={() => updateSettings({ textStyle: s.key })}>
                    {s.label}
                  </NeuButton>
                ))}
              </div>
            </NeuCard>

            <NeuCard glass className="p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Display</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Font Size</span>
                <div className="flex gap-1">
                  {(["small", "medium", "large"] as const).map((sz) => (
                    <NeuButton key={sz} size="sm" active={settings.fontSize === sz} onClick={() => updateSettings({ fontSize: sz })}>
                      {sz.charAt(0).toUpperCase() + sz.slice(1)}
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
                    <NeuButton key={len} size="sm" active={settings.responseLength === len} onClick={() => updateSettings({ responseLength: len })}>
                      {len.charAt(0).toUpperCase() + len.slice(1)}
                    </NeuButton>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">History Window</span>
                  <span className="text-[var(--accent)]">{settings.historyWindow} turns</span>
                </div>
                <input type="range" min="4" max="50" step="2" value={settings.historyWindow}
                  onChange={(e) => updateSettings({ historyWindow: parseInt(e.target.value) })}
                  className="w-full accent-[var(--accent)]" />
              </div>
            </NeuCard>

            <button onClick={() => { if (confirm("Reset all settings to defaults?")) resetSettings(); }}
              className="text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors">
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
