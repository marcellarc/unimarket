import { DashboardPage } from '@/pages/dashboard/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return <DashboardPage />
}
