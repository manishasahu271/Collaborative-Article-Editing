import RegisterForm from '../components/auth/RegisterForm.jsx'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="editorial-card w-full max-w-md px-8 py-10">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-3xl font-semibold">Join the community</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Create an account to write, edit, and review.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
