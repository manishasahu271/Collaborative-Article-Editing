import StatusBadge from '../common/StatusBadge.jsx'

export default function ArticleCard({ article, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="editorial-card w-full text-left p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2 bg-[var(--surface)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {article.title}
        </h3>
        <StatusBadge status={article.status} />
      </div>
      <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
        {article.content?.slice(0, 160) || 'No content yet.'}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.18em]">
        <span>{article.user?.username ?? 'Unknown author'}</span>
        <span>
          v{article.currentVersionId ?? 1} ·{' '}
          {article.creationDate ? new Date(article.creationDate).toLocaleDateString() : '—'}
        </span>
      </div>
    </button>
  )
}
