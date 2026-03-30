import Layout from '../components/layout/Layout.jsx'
import WorkflowDashboard from '../components/workflow/WorkflowDashboard.jsx'

export default function WorkflowPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Workflow</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Follow each article as it moves from draft to publication.
          </p>
        </div>
        <WorkflowDashboard />
      </div>
    </Layout>
  )
}
