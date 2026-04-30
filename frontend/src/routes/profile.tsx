import { ProfilePage } from '@/pages/profile/page'
import { requireAuth } from '@/utils/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
    beforeLoad: requireAuth,
    component: ProfilePage,
})
