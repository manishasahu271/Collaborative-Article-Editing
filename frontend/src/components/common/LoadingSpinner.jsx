export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
      <div className="h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium tracking-wide">Loading...</p>
    </div>
  )
}
