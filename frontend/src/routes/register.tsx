import { createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/pages/register/sign-up-form'
import { isAuthenticated } from '@/utils/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: isAuthenticated,
  component: RouteComponent,
})

function RouteComponent() {
  return (

    <SignUpForm />

  )
}