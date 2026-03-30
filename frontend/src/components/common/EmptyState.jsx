import { BookOpen } from 'lucide-react'

export default function EmptyState({ title = 'No articles yet', description = 'Start by writing your first piece.' }) {
  return (
    <div className="editorial-card flex flex-col items-center justify-center gap-3 px-6 py-10 text-center bg-[var(--bg)]">
      <div className="h-12 w-12 rounded-full bg-[#F5F1EB] flex items-center justify-center mb-2">
        <BookOpen className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md">{description}</p>
    </div>
  )
}
