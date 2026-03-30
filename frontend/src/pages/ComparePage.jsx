import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/layout/Layout.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import VersionCompare from '../components/articles/VersionCompare.jsx'

export default function ComparePage() {
  const { articleId } = useParams()
  const [searchParams] = useSearchParams()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/article/${articleId}`)
        setVersions(res.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [articleId])

  const leftId = Number(searchParams.get('left')) || versions[0]?.currentVersionId
  const rightId = Number(searchParams.get('right')) || versions[versions.length - 1]?.currentVersionId

  const left = useMemo(() => versions.find((v) => v.currentVersionId === leftId), [versions, leftId])
  const right = useMemo(() => versions.find((v) => v.currentVersionId === rightId), [versions, rightId])

  return (
    <Layout>
      {loading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : !versions.length ? (
        <p className="text-sm text-[var(--text-secondary)]">No versions available to compare.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Compare versions</h1>
              <p className="text-sm text-[var(--text-secondary)]">Highlighting changes between two revisions.</p>
            </div>
          </div>
          <VersionCompare left={left} right={right} />
        </div>
      )}
    </Layout>
  )
}
