import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-primary)]">
      <Navbar />
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 flex flex-col gap-4">{children}</main>
      </div>
    </div>
  )
}
