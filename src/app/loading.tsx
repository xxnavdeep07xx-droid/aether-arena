export default function Loading() {
  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-arena-accent/20 animate-spin-slow" />
        <p className="text-sm text-arena-text-muted">Loading Aether Arena...</p>
      </div>
    </div>
  );
}
