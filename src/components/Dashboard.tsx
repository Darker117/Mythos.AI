import { useRef } from "react";
import {
  Plus,
  BookOpen,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { useAdventureStore } from "../store/adventureStore";
import { useGameStore } from "../store/gameStore";
import { NeuCard } from "./neumorphic/Primitives";

export default function Dashboard() {
  const { adventures, deleteAdventure, duplicateAdventure, setActiveAdventure } =
    useAdventureStore();
  const { setView, openCreator } = useGameStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  function handlePlay(id: string) {
    setActiveAdventure(id);
    setView("game");
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (confirm("Delete this adventure? This cannot be undone.")) {
      deleteAdventure(id);
    }
  }

  function handleDuplicate(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    duplicateAdventure(id);
  }

  function handleEdit(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    openCreator(id);
  }

  function scroll(dir: "left" | "right") {
    carouselRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto relative">
        {/* Sticky glass header */}
        <div className="sticky top-0 z-10 mb-8 glass-card px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Welcome back
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Your adventures await
              </p>
            </div>
            <button
              onClick={() => openCreator()}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer hover:brightness-110 accent-glow"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Plus size={18} />
              New Adventure
            </button>
          </div>
        </div>

        {/* Adventures */}
        {adventures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)]">
            <BookOpen size={56} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No adventures yet</p>
            <p className="text-sm mt-1">Create your first story to get started</p>
            <button
              onClick={() => openCreator()}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer accent-glow"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Sparkles size={16} />
              Create Adventure
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Recent Adventures
              </h2>
              {adventures.length > 3 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll("left")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {adventures.map((adventure) => (
                <NeuCard
                  key={adventure.id}
                  clickable
                  glass
                  onClick={() => handlePlay(adventure.id)}
                  className="min-w-[280px] max-w-[320px] snap-start shrink-0 p-5 group"
                >
                  {/* Genre badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--accent-muted)",
                        color: "var(--accent)",
                      }}
                    >
                      {adventure.genre}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(adventure.updatedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1 truncate">
                    {adventure.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4 min-h-[2rem]">
                    {adventure.description || adventure.setting || "No description"}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{adventure.history.length} turns</span>
                    <span>{adventure.storyCards.length} cards</span>
                  </div>

                  {/* Action buttons — appear on hover */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(e, adventure.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer transition-colors"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, adventure.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, adventure.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </NeuCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
