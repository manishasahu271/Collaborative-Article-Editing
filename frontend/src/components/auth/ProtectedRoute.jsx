import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

export default function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
