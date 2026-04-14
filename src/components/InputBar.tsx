import { useState, useRef, useEffect } from "react";
import { Send, Sword, MessageCircle, Pen, Eye, Undo2 } from "lucide-react";
import { useGameStore, type InputMode } from "../store/gameStore";

interface InputBarProps {
  onSubmit: (text: string, mode: InputMode) => void;
  onUndo: () => void;
  disabled: boolean;
  canUndo: boolean;
}

const MODE_CONFIG: Record<InputMode, { icon: typeof Sword; label: string; placeholder: string }> = {
  do: { icon: Sword, label: "Do", placeholder: "What do you do?" },
  say: { icon: MessageCircle, label: "Say", placeholder: "What do you say?" },
  story: { icon: Pen, label: "Story", placeholder: "Continue the story..." },
  see: { icon: Eye, label: "See", placeholder: "What do you observe?" },
};

export default function InputBar({ onSubmit, onUndo, disabled, canUndo }: InputBarProps) {
  const { inputMode, setInputMode } = useGameStore();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled, inputMode]);

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, inputMode);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 150) + "px";
    }
  }

  const config = MODE_CONFIG[inputMode];
  const modes: InputMode[] = ["do", "say", "story", "see"];

  return (
    <div className="border-t border-white/5 px-4 py-3 bg-[#1a1a1a]/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto">
        {/* Mode selector */}
        <div className="flex items-center gap-1 mb-2">
          {modes.map((mode) => {
            const cfg = MODE_CONFIG[mode];
            const Icon = cfg.icon;
            const active = mode === inputMode;
            return (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active ? "bg-white/10 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Icon size={13} />
                {cfg.label}
              </button>
            );
          })}
          <div className="flex-1" />
          {canUndo && (
            <button
              onClick={onUndo}
              disabled={disabled}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
            >
              <Undo2 size={13} /> Undo
            </button>
          )}
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 rounded-2xl p-2 bg-[#1a1a1a] border border-white/5 shadow-[inset_3px_3px_6px_#111,inset_-3px_-3px_6px_#2a2a2a]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm py-2 px-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            style={{ maxHeight: "150px" }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !text.trim()}
            className="p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
            style={{
              backgroundColor: text.trim() && !disabled ? "var(--accent)" : "#2a2a2a",
              color: text.trim() && !disabled ? "#fff" : "var(--text-muted)",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
