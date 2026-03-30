import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner.jsx'
import StatusBadge from '../common/StatusBadge.jsx'

export default function WorkflowDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/workflow/workflow')
        const all = res.data || []
        const myId = user?.userId
        if (myId == null || !user?.role) {
          setItems([])
          return
        }

        const role = String(user.role).toLowerCase()
        const filtered = all.filter((wf) => {
          if (role === 'editor') {
            return String(wf.editorUserId) === String(myId)
          }
          if (role === 'reviewer') {
            return String(wf.reviewerUserId) === String(myId)
          }
          if (role === 'author') {
            const authorId = wf.article?.user?.userId ?? wf.article?.userId ?? wf.article?.user?.id
            return String(authorId) === String(myId)
          }
          return false
        })

        // Deduplicate by articleId; keep the most recent workflow per article.
        // Prefer submissionDate if parseable; otherwise keep the last seen entry.
        const byArticle = new Map()
        for (const wf of filtered) {
          const articleId = wf.article?.articleId
          if (!articleId) continue
          const prev = byArticle.get(articleId)
          if (!prev) {
            byArticle.set(articleId, wf)
            continue
          }
          const prevT = Date.parse(prev.submissionDate ?? '')
          const curT = Date.parse(wf.submissionDate ?? '')
          if (!Number.isNaN(curT) && (Number.isNaN(prevT) || curT >= prevT)) {
            byArticle.set(articleId, wf)
          } else if (Number.isNaN(curT) && Number.isNaN(prevT)) {
            byArticle.set(articleId, wf)
          }
        }
        setItems(Array.from(byArticle.values()))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!items.length) {
    return <p className="text-sm text-[var(--text-secondary)]">No workflows yet.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((wf) => (
        <button
          key={wf.id}
          type="button"
          onClick={() => navigate(`/articles/${wf.article?.articleId}`)}
          className="editorial-card p-4 bg-white flex flex-col gap-2 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{wf.article?.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">Article ID: {wf.article?.articleId}</p>
            </div>
            <StatusBadge status={wf.article?.status} />
          </div>
          <div className="text-xs text-[var(--text-secondary)] flex flex-wrap gap-3">
            <span>Editor: {wf.editorUserId || '—'}</span>
            <span>Reviewer: {wf.reviewerUserId || '—'}</span>
            <span>Submitted: {wf.submissionDate || '—'}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
