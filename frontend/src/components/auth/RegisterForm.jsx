import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ROLE_OPTIONS = [
  { label: 'Author', value: 'author' },
  { label: 'Editor', value: 'editor' },
  { label: 'Reviewer', value: 'reviewer' },
]

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('author')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return
    }
    setSubmitting(true)
    const ok = await register(username, password, role)
    setSubmitting(false)
    if (ok) {
      navigate('/dashboard', { replace: true })
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
          required
        />
      </div>
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium" htmlFor="confirm">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="input bg-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
      <p className="text-xs text-center text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  )
}
