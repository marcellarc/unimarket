import { DashboardPage } from '@/pages/dashboard/page'
import { requireAuth } from '@/utils/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
    beforeLoad: requireAuth,
    component: RouteComponent,
})

function RouteComponent() {
    return <DashboardPage />
}
