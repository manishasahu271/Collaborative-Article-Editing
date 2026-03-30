import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(username, password)
    setSubmitting(false)
    if (ok) {
      const from = location.state?.from?.pathname || '/dashboard'
      toast.success('Welcome back')
      navigate(from, { replace: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
      <p className="text-xs text-center text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  )
}
