import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, PanelRightOpen } from "lucide-react";
import { useAdventureStore } from "../store/adventureStore";
import { useSettingsStore } from "../store/settingsStore";
import { useGameStore, type InputMode } from "../store/gameStore";
import {
  buildMessages,
  buildInitialMessages,
  createChatMessage,
} from "../engine/promptBuilder";
import {
  generateCompletion,
  generateCompletionStream,
} from "../engine/llmClient";
import { detectAndGenerateCards } from "../engine/cardGenerator";
import { extractWorldState } from "../engine/worldStateTracker";
import { extractEvents } from "../engine/eventLog";
import { maybeSummarize } from "../engine/summarizer";
import StoryFeed from "./StoryFeed";
import InputBar from "./InputBar";
import SettingsSidebar from "./adventure/SettingsSidebar";

export default function GameView() {
  const { getActiveAdventure, addMessage, undoLastExchange, addStoryCard, updateStoryCard, updateAdventure, updatePlot } =
    useAdventureStore();
  const { settings } = useSettingsStore();
  const {
    setView,
    isGenerating,
    setGenerating,
    setStreamingText,
    appendStreamingText,
    settingsPanelOpen,
    toggleSettingsPanel,
    setError,
    error,
  } = useGameStore();

  const adventure = getActiveAdventure();

  // Guard against React StrictMode double-mount + stale closure re-fires.
  const openingFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      adventure &&
      adventure.history.length === 0 &&
      !isGenerating &&
      openingFiredRef.current !== adventure.id
    ) {
      openingFiredRef.current = adventure.id;
      generateOpening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure?.id]);

  /**
   * Post-response analysis pipeline. Runs sequentially after the main
   * narrative stream completes. Each step is independently try-caught —
   * a failure in one never blocks the rest. The spinner stays visible
   * during this phase.
   *
   * Sequential execution is critical: local LLMs (LM Studio) are
   * single-threaded, so concurrent requests corrupt each other.
   */
  const postResponsePipeline = useCallback(
    async (responseText: string) => {
      if (!adventure) return;

      // 1. Generate/update story cards.
      try {
        const cardResult = await detectAndGenerateCards(
          responseText,
          adventure.storyCards,
          settings.llm,
        );
        for (const card of cardResult.newCards) {
          addStoryCard(adventure.id, card);
        }
        for (const upd of cardResult.updatedCards) {
          updateStoryCard(adventure.id, upd.id, {
            content: upd.content,
            trigger: upd.trigger,
          });
        }
      } catch {
        // Card generation is non-critical.
      }

      // 2. Extract world state.
      try {
        const newWorldState = await extractWorldState(
          responseText,
          adventure.worldState,
          settings.llm,
        );
        updateAdventure(adventure.id, { worldState: newWorldState });
      } catch {
        // World state extraction is non-critical.
      }

      // 3. Extract key events (if memoryBank enabled).
      if (settings.memoryBank) {
        try {
          const newEvents = await extractEvents(
            responseText,
            adventure.history.length,
            settings.llm,
          );
          if (newEvents.length > 0) {
            updateAdventure(adventure.id, {
              events: [...adventure.events, ...newEvents],
            });
          }
        } catch {
          // Event extraction is non-critical.
        }
      }

      // 4. Auto-summarize (if enabled and threshold met).
      if (settings.autoSummarize) {
        try {
          // Re-read adventure to get the latest history length after addMessage.
          const freshAdventure = useAdventureStore.getState().adventures.find(
            (a) => a.id === adventure.id,
          );
          if (freshAdventure) {
            const result = await maybeSummarize(freshAdventure, settings.llm);
            if (result) {
              updatePlot(adventure.id, { storySummary: result.summary });
              updateAdventure(adventure.id, {
                summarizedUpTo: result.newSummarizedUpTo,
              });
            }
          }
        } catch {
          // Summarization is non-critical.
        }
      }
    },
    [adventure, settings, addStoryCard, updateStoryCard, updateAdventure, updatePlot],
  );

  const generateOpening = useCallback(async () => {
    if (!adventure) return;
    setGenerating(true);
    setStreamingText("");
    setError(null);

    try {
      const messages = buildInitialMessages(adventure);
      let fullText = "";
      if (settings.streamResponses) {
        for await (const chunk of generateCompletionStream(messages, settings.llm)) {
          fullText += chunk;
          appendStreamingText(chunk);
        }
      } else {
        fullText = await generateCompletion(messages, settings.llm);
      }
      addMessage(adventure.id, createChatMessage("assistant", fullText));

      // Run the full post-response pipeline.
      await postResponsePipeline(fullText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to LLM");
    } finally {
      setGenerating(false);
      setStreamingText("");
    }
  }, [adventure, settings, addMessage, setGenerating, setStreamingText, appendStreamingText, setError, postResponsePipeline]);

  const handleSubmit = useCallback(
    async (text: string, mode: InputMode) => {
      if (!adventure || isGenerating) return;
      addMessage(adventure.id, createChatMessage("user", text, mode));
      setGenerating(true);
      setStreamingText("");
      setError(null);

      try {
        const messages = buildMessages(adventure, text, mode, settings);
        let fullText = "";
        if (settings.streamResponses) {
          for await (const chunk of generateCompletionStream(messages, settings.llm)) {
            fullText += chunk;
            appendStreamingText(chunk);
          }
        } else {
          fullText = await generateCompletion(messages, settings.llm);
        }
        addMessage(adventure.id, createChatMessage("assistant", fullText));

        // Run the full post-response pipeline.
        await postResponsePipeline(fullText);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect to LLM");
      } finally {
        setGenerating(false);
        setStreamingText("");
      }
    },
    [adventure, isGenerating, settings, addMessage, setGenerating, setStreamingText, appendStreamingText, setError, postResponsePipeline],
  );

  function handleUndo() {
    if (adventure) undoLastExchange(adventure.id);
  }

  if (!adventure) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        <p>Adventure not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] shrink-0">
          <button onClick={() => setView("dashboard")} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] cursor-pointer transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate">{adventure.name}</h2>
            <span className="text-xs text-[var(--text-muted)]">{adventure.genre}</span>
          </div>
          <button
            onClick={toggleSettingsPanel}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${settingsPanelOpen ? "bg-white/10 text-[var(--accent)]" : "hover:bg-white/5 text-[var(--text-muted)]"}`}
          >
            <PanelRightOpen size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 text-xs bg-red-500/10 text-red-400 border-b border-white/5">
            {error}
          </div>
        )}

        {/* Story */}
        <StoryFeed history={adventure.history} />

        {/* Input */}
        <InputBar
          onSubmit={handleSubmit}
          onUndo={handleUndo}
          disabled={isGenerating}
          canUndo={adventure.history.length >= 2}
        />
      </div>

      {/* Settings sidebar */}
      <SettingsSidebar adventure={adventure} />
    </div>
  );
}
