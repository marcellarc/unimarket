import { createFileRoute, redirect } from '@tanstack/react-router'
import { hasActiveAccessToken } from '@/utils/auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: hasActiveAccessToken() ? '/dashboard' : '/login' })
  },
})
