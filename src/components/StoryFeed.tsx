import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { ChatMessage } from "../types";
import { useGameStore } from "../store/gameStore";
import { useSettingsStore } from "../store/settingsStore";

interface StoryFeedProps {
  history: ChatMessage[];
}

export default function StoryFeed({ history }: StoryFeedProps) {
  const { isGenerating, streamingText } = useGameStore();
  const { settings } = useSettingsStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, streamingText]);

  const textStyleClass = `text-style-${settings.textStyle}`;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className={`max-w-3xl mx-auto story-text ${textStyleClass}`}>
        {history.length === 0 && !isGenerating && (
          <div className="text-center py-24 text-[var(--text-muted)]">
            <p className="text-lg italic">The story has yet to begin...</p>
          </div>
        )}

        {history.map((msg) => (
          <div key={msg.id} className="mb-6">
            {msg.role === "user" ? (
              <div className="pl-4 border-l-2 italic text-[var(--accent)]" style={{ borderColor: "var(--accent)" }}>
                {msg.content}
              </div>
            ) : (
              <div className="leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isGenerating && streamingText && (
          <div className="mb-6 leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
            {streamingText}
            <span className="inline-block w-2 h-5 ml-1 animate-pulse rounded-sm" style={{ backgroundColor: "var(--accent)" }} />
          </div>
        )}

        {isGenerating && !streamingText && (
          <div className="flex items-center gap-2 py-4 text-[var(--text-muted)]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm italic">The story unfolds...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
