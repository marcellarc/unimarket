import { InfoPage } from '@/pages/info/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <InfoPage variant="about" />
}
