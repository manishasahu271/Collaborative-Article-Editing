import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Rows3, Rows } from 'lucide-react'
import api from '../../api/axios'
import useAuth from '../../hooks/useAuth'
import ArticleCard from './ArticleCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

function pickLatestPerArticle(items) {
  const byArticleId = new Map()
  for (const a of items || []) {
    const id = a?.articleId
    if (!id) continue
    const prev = byArticleId.get(id)
    if (!prev) {
      byArticleId.set(id, a)
      continue
    }
    const prevTime = Date.parse(prev.lastModifiedDate ?? '') || Date.parse(prev.creationDate ?? '') || 0
    const curTime = Date.parse(a.lastModifiedDate ?? '') || Date.parse(a.creationDate ?? '') || 0
    if (curTime > prevTime) {
      byArticleId.set(id, a)
      continue
    }
    if (curTime < prevTime) continue

    const prevSr = Number(prev.srNo ?? 0)
    const curSr = Number(a.srNo ?? 0)
    if (curSr > prevSr) {
      byArticleId.set(id, a)
      continue
    }

    // Fall back to currentVersionId if the backend sets it per row
    const prevV = Number(prev.currentVersionId ?? 0)
    const curV = Number(a.currentVersionId ?? 0)
    if (curV > prevV) byArticleId.set(id, a)
  }
  return Array.from(byArticleId.values())
}

function normalizeStatus(s) {
  return String(s ?? '').toLowerCase()
}

export default function ArticleList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const scope = searchParams.get('scope')
    const load = async () => {
      setLoading(true)
      try {
        let res
        if (scope === 'my' && user?.userId) {
          res = await api.get(`/api/article/user/${user.userId}`)
        } else {
          res = await api.get('/api/article')
        }
        const list = pickLatestPerArticle(res.data || [])
        const finalList =
          scope === 'approved'
            ? list.filter((a) => normalizeStatus(a.status) === 'approved')
            : list
        setArticles(finalList)
      } catch (e) {
        console.error(e)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams, user])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <h2 className="text-2xl font-semibold">Articles</h2>
          <p className="text-sm text-[var(--text-secondary)]">Your workspace for drafts and published pieces.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-[var(--border-subtle)] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`px-2 py-1 text-xs ${view === 'grid' ? 'bg-[#F5F1EB]' : ''}`}
            >
              <Rows3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`px-2 py-1 text-xs ${view === 'list' ? 'bg-[#F5F1EB]' : ''}`}
            >
              <Rows className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/articles/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState />
      ) : view === 'grid' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {articles.map((a) => (
            <ArticleCard
              key={`${a.articleId}-${a.currentVersionId ?? ''}`}
              article={a}
              onClick={() => navigate(`/articles/${a.articleId}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((a) => (
            <ArticleCard
              key={`${a.articleId}-${a.currentVersionId ?? ''}`}
              article={a}
              onClick={() => navigate(`/articles/${a.articleId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
