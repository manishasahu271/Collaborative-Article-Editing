import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

function renderDiff(textA = '', textB = '') {
  const diffs = dmp.diff_main(textA, textB)
  dmp.diff_cleanupSemantic(diffs)

  return diffs.map(([op, text], idx) => {
    if (!text) return null
    if (op === 0) {
      return (
        <span key={idx}>
          {text}
        </span>
      )
    }
    if (op === -1) {
      return (
        <span key={idx} className="bg-rose-50 line-through">
          {text}
        </span>
      )
    }
    if (op === 1) {
      return (
        <span key={idx} className="bg-emerald-50">
          {text}
        </span>
      )
    }
    return null
  })
}

export default function VersionCompare({ left, right }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="editorial-card p-4 bg-white">
        <h3 className="text-sm font-semibold mb-2">Version A</h3>
        <h4 className="font-semibold mb-2">{left?.title}</h4>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          {left?.lastModifiedDate && new Date(left.lastModifiedDate).toLocaleString()}
        </p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{renderDiff(left?.content, right?.content)}</div>
      </div>
      <div className="editorial-card p-4 bg-white">
        <h3 className="text-sm font-semibold mb-2">Version B</h3>
        <h4 className="font-semibold mb-2">{right?.title}</h4>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          {right?.lastModifiedDate && new Date(right.lastModifiedDate).toLocaleString()}
        </p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{renderDiff(right?.content, left?.content)}</div>
      </div>
    </div>
  )
}
