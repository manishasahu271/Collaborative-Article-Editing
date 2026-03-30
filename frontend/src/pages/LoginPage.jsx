import LoginForm from '../components/auth/LoginForm.jsx'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="editorial-card w-full max-w-md px-8 py-10">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sign in to continue writing and reviewing.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
