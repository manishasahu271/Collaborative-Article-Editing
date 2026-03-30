import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'
import Layout from '../components/layout/Layout.jsx'

export default function ArticleCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean)
    return content.trim() ? words.length : 0
  }, [content])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.userId) {
      toast.error('Missing userId')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/api/article/user/${user.userId}`, { title, content })
      toast.success('Article created')
      navigate('/dashboard?scope=my', { replace: true })
    } catch (err) {
      console.error(err)
      toast.error('Failed to create article')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="editorial-card p-6 bg-white">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">New Article</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            A clean page to begin — like opening a beautiful book.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="An unforgettable title…"
              className="w-full text-2xl md:text-3xl font-semibold bg-transparent focus:outline-none border-b border-[var(--border-subtle)] py-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write with generous margins and quiet focus…"
              className="w-full min-h-[320px] p-4 rounded-md border border-[var(--border-subtle)] bg-[#FDFBF7] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_rgba(139,92,246,0.4)] text-[18px] leading-[1.8] whitespace-pre-wrap"
              style={{ fontFamily: "'Lora', serif" }}
              required
            />
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{content.length} characters</span>
              <span>{wordCount} words</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/dashboard', { replace: true })}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

