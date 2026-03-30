import { Link, Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function LandingPage() {
  const { user, token } = useAuth()

  if (user && token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-wide">
            Collaborative Article Editing
          </h1>
          <p className="text-lg md:text-xl italic text-[var(--text-secondary)]">
            “Where words come together.”
          </p>
        </div>

        <div className="editorial-card px-6 py-8 bg-[#FBF6EF]">
          <p className="typewriter text-base md:text-lg text-left text-[var(--text-secondary)]">
            Type something to start...
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="btn-ghost w-full sm:w-auto">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Get Started
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)] uppercase tracking-[0.3em]">
          <span className="flex-1 h-px bg-[var(--border-subtle)]" />
          <span>❦</span>
          <span className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
      </div>
    </div>
  )
}
