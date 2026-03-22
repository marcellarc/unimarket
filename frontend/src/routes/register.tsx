import { SignUpForm } from '@/pages/register/sign-up-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpForm />
}
