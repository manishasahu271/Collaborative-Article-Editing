export default function StatusBadge({ status }) {
  const s = String(status ?? '').toLowerCase()
  const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize'

  if (s === 'approved') {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-800 border-emerald-200`}>
        Approved
      </span>
    )
  }

  if (s === 'rejected') {
    return (
      <span className={`${base} bg-red-50 text-red-800 border-red-200`}>
        Rejected
      </span>
    )
  }

  return (
    <span className={`${base} bg-yellow-50 text-yellow-800 border-yellow-200`}>
      In Progress
    </span>
  )
}
