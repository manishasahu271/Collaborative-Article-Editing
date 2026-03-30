import { LayoutDashboard, FileText, CheckCircle2, Workflow } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const baseLink =
  'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[#F5F1EB] text-[var(--text-secondary)]'

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-60 border-r border-[var(--border-subtle)] bg-[#FBF6EF]/80 px-4 py-6 hidden md:flex flex-col gap-3">
      <nav className="space-y-1 text-sm">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? 'bg-white text-[var(--text-primary)] shadow-sm' : ''}`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/dashboard?scope=my"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? 'bg-white text-[var(--text-primary)] shadow-sm' : ''}`
          }
        >
          <FileText className="h-4 w-4" />
          My Articles
        </NavLink>
        <NavLink
          to="/dashboard?scope=approved"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? 'bg-white text-[var(--text-primary)] shadow-sm' : ''}`
          }
        >
          <CheckCircle2 className="h-4 w-4" />
          Approved
        </NavLink>
        {(user?.role === 'editor' || user?.role === 'reviewer') && (
          <NavLink
            to="/workflow"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? 'bg-white text-[var(--text-primary)] shadow-sm' : ''}`
            }
          >
            <Workflow className="h-4 w-4" />
            Workflow
          </NavLink>
        )}
      </nav>
      <div className="mt-auto pt-4 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
        <p className="italic">“Where words come together.”</p>
      </div>
    </aside>
  )
}
