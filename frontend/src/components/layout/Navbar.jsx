import { LogOut } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 backdrop-blur-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-[0.18em] uppercase">Collab</span>
        <span className="text-sm italic text-[var(--text-secondary)]">Article Editing</span>
      </div>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="font-medium">{user.username}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {user.role}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
