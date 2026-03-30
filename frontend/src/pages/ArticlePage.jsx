import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'
import Layout from '../components/layout/Layout.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'

export default function ArticlePage() {
  const { articleId } = useParams()
  const [versions, setVersions] = useState([])
  const [workflow, setWorkflow] = useState(null)
  const [workflowExists, setWorkflowExists] = useState(false)
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [showReviewerAssign, setShowReviewerAssign] = useState(false)
  const [reviewers, setReviewers] = useState([])
  const [reviewerId, setReviewerId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchArticleVersions = async () => {
    const res = await api.get(`/api/article/${articleId}`)
    const list = res.data || []
    list.sort((a, b) => (a.currentVersionId ?? 0) - (b.currentVersionId ?? 0))
    return list
  }

  const loadArticle = async () => {
    setLoading(true)
    try {
      const list = await fetchArticleVersions()
      setVersions(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkflow = async () => {
    setWorkflowLoading(true)
    try {
      // Backend returns HttpStatus.FOUND (302) for existing workflows.
      // Accept 302 as a successful response so we can read the body.
      const res = await api.get(`/workflow/${articleId}`, {
        validateStatus: (status) => status >= 200 && status < 400,
      })
      console.log('[workflow] GET /workflow/' + articleId, res.data)
      setWorkflow(res.data)
      setWorkflowExists(true)
    } catch (e) {
      console.log('[workflow] GET /workflow/' + articleId + ' failed', e?.response?.status, e)
      setWorkflow(null)
      setWorkflowExists(false)
    } finally {
      setWorkflowLoading(false)
    }
  }

  useEffect(() => {
    loadArticle()
    loadWorkflow()
  }, [articleId])

  const latest = versions[versions.length - 1]
  const isEditor = user?.role === 'editor'
  const isReviewer = user?.role === 'reviewer'
  const isAssignedToMe = useMemo(() => {
    if (!workflow || !user?.userId) return false
    return String(workflow.editorUserId) === String(user.userId)
  }, [workflow, user])
  const isAssignedToOtherEditor = useMemo(() => {
    if (!workflowExists || !workflow) return false
    if (!workflow.editorUserId) return false
    if (!user?.userId) return true
    return String(workflow.editorUserId) !== String(user.userId)
  }, [workflowExists, workflow, user])

  const isReviewerAssignedToMe = useMemo(() => {
    if (!workflowExists || !workflow || !user?.userId) return false
    return String(workflow.reviewerUserId) === String(user.userId)
  }, [workflowExists, workflow, user])

  useEffect(() => {
    if (latest && showEdit) {
      setEditTitle(latest.title || '')
      setEditContent(latest.content || '')
    }
  }, [latest, showEdit])

  const assignToMe = async () => {
    if (!user?.userId) return
    setAssigning(true)
    try {
      await api.get(`/workflow/assign/editor/${articleId}/${user.userId}`)
      toast.success('Assigned to you as editor')
      await loadWorkflow()
    } catch (e) {
      console.error(e)
      toast.error('Failed to assign editor')
    } finally {
      setAssigning(false)
    }
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    if (!user?.userId) return
    setSubmittingEdit(true)
    try {
      await api.post(`/workflow/edit/editor/${articleId}/${user.userId}`, {
        title: editTitle,
        content: editContent,
      })
      toast.success('Edits saved')
      setShowEdit(false)
      await loadArticle()
      await loadWorkflow()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save edits')
    } finally {
      setSubmittingEdit(false)
    }
  }

  const openReviewerAssign = async () => {
    setShowReviewerAssign(true)
    try {
      const res = await api.get('/user/role/reviewer')
      setReviewers(res.data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load reviewers')
    }
  }

  const assignReviewer = async () => {
    if (!reviewerId) return
    setAssigning(true)
    try {
      await api.get(`/workflow/assign/reviewer/${articleId}/${reviewerId}`)
      toast.success('Reviewer assigned')
      setShowReviewerAssign(false)
      setReviewerId('')
      await loadWorkflow()
    } catch (e) {
      console.error(e)
      toast.error('Failed to assign reviewer')
    } finally {
      setAssigning(false)
    }
  }

  const submitReviewerFeedback = async (e) => {
    e.preventDefault()
    if (!reviewFeedback.trim()) return
    setSubmittingFeedback(true)
    try {
      await api.post(`/workflow/feedback/reviewer/${articleId}`, { reviewFeedback })
      toast.success('Feedback submitted')
      setReviewFeedback('')
      await loadWorkflow()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const approveArticle = async () => {
    setChangingStatus(true)
    try {
      const token = localStorage.getItem('token')
      await axios.get(`/workflow/editor/workflow/review/status/approved/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Marked as approved')
      await loadArticle()
      await loadWorkflow()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    } finally {
      setChangingStatus(false)
    }
  }

  const rejectArticle = async () => {
    setChangingStatus(true)
    try {
      const token = localStorage.getItem('token')
      await axios.get(`/workflow/editor/workflow/review/status/rejected/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Marked as rejected')
      await loadArticle()
      await loadWorkflow()
    } catch (err) {
      console.error(err)
      toast.error('Failed to reject')
    } finally {
      setChangingStatus(false)
    }
  }

  return (
    <Layout>
      {loading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !latest ? (
        <p className="text-sm text-[var(--text-secondary)]">Article not found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="editorial-card p-6 bg-white">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-semibold mb-1">{latest.title}</h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Latest version ·{' '}
                  {latest.lastModifiedDate && new Date(latest.lastModifiedDate).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={latest.status} />
            </div>

            {isEditor && (
              <div className="flex flex-wrap gap-2 mb-4">
                {!workflowExists ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={assignToMe}
                    disabled={assigning || workflowLoading}
                  >
                    {assigning ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                        Assigning…
                      </span>
                    ) : (
                      'Assign to me as Editor'
                    )}
                  </button>
                ) : isAssignedToOtherEditor ? (
                  <div className="text-sm text-[var(--text-secondary)]">
                    Already assigned to editor{' '}
                    <span className="font-medium text-[var(--text-primary)]">{workflow?.editorUserId}</span>
                  </div>
                ) : null}

                {isAssignedToMe && (
                  <>
                    <button type="button" className="btn-ghost" onClick={() => setShowEdit((s) => !s)}>
                      Edit Article
                    </button>
                    <button type="button" className="btn-ghost" onClick={openReviewerAssign}>
                      Assign Reviewer
                    </button>
                  </>
                )}
              </div>
            )}

            {isReviewer && isReviewerAssignedToMe && (
              <div className="editorial-card p-4 bg-[#FBF6EF] mb-5 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Reviewer actions</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Provide feedback and approve or reject this article.
                  </p>
                </div>

                <form onSubmit={submitReviewerFeedback} className="space-y-2">
                  <textarea
                    className="input bg-white min-h-[120px] leading-relaxed"
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Write reviewer feedback…"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn-primary" disabled={submittingFeedback}>
                      {submittingFeedback ? 'Submitting…' : 'Give Feedback'}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={approveArticle}
                      disabled={changingStatus}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={rejectArticle}
                      disabled={changingStatus}
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isEditor && isAssignedToMe && showEdit && (
              <form onSubmit={submitEdit} className="editorial-card p-4 bg-[#FBF6EF] mb-5 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="editTitle">
                    Title
                  </label>
                  <input
                    id="editTitle"
                    className="input bg-white"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="editContent">
                    Content
                  </label>
                  <textarea
                    id="editContent"
                    className="input bg-white min-h-[180px] leading-relaxed"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-primary" type="submit" disabled={submittingEdit}>
                    {submittingEdit ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => setShowEdit(false)}
                    disabled={submittingEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isEditor && isAssignedToMe && showReviewerAssign && (
              <div className="editorial-card p-4 bg-[#FBF6EF] mb-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Assign a reviewer</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Select a reviewer to continue the pipeline.</p>
                  </div>
                  <button className="btn-ghost text-xs px-3 py-1" type="button" onClick={() => setShowReviewerAssign(false)}>
                    Close
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="input bg-white"
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                  >
                    <option value="">Select reviewer…</option>
                    {reviewers.map((r) => (
                      <option key={r.userId} value={r.userId}>
                        {r.username} (#{r.userId})
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn-primary" onClick={assignReviewer} disabled={!reviewerId || assigning}>
                    Assign
                  </button>
                </div>
              </div>
            )}

            <article className="prose max-w-none text-[var(--text-primary)] text-[15px] leading-relaxed whitespace-pre-wrap">
              {latest.content}
            </article>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="editorial-card p-4 flex-1 bg-white">
              <h2 className="text-sm font-semibold mb-3 tracking-[0.18em] uppercase text-[var(--text-secondary)]">
                Version history
              </h2>
              <ul className="space-y-2 text-sm">
                {versions.map((v) => (
                  <li key={v.currentVersionId} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">Version {v.currentVersionId}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {v.lastModifiedDate && new Date(v.lastModifiedDate).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => navigate(`/articles/${articleId}/compare?left=${latest.currentVersionId}&right=${v.currentVersionId}`)}
                      disabled={String(v.currentVersionId) === String(latest.currentVersionId)}
                    >
                      Compare with latest
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
