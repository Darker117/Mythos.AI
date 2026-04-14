export default function BackgroundGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Blob 1 — top left */}
      <div
        className="blob-1 absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl mix-blend-screen"
        style={{ background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.6), transparent 70%)` }}
      />
      {/* Blob 2 — bottom right */}
      <div
        className="blob-2 absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full opacity-10 blur-3xl mix-blend-screen"
        style={{ background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.5), transparent 70%)` }}
      />
      {/* Blob 3 — center float */}
      <div
        className="blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-8 blur-3xl mix-blend-screen"
        style={{ background: `radial-gradient(circle, rgba(var(--accent-rgb), 0.3), transparent 70%)` }}
      />
    </div>
  );
}
