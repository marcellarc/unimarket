import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login/page'
import { isAuthenticated } from '@/utils/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: isAuthenticated,
  component: RouteComponent,
})

function RouteComponent() {

  return (

    <LoginPage />

  )
}