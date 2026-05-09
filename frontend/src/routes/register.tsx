import { createFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '@/pages/register/page'
import { isAuthenticated } from '@/utils/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: isAuthenticated,
  component: RouteComponent,
})

function RouteComponent() {
  return (

    <RegisterPage />

  )
}
