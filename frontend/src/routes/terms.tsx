import { LegalPage } from '@/pages/info/legal-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LegalPage variant="terms" />
}
