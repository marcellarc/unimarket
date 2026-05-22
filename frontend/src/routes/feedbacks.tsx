import { FeedbacksPage } from '@/pages/feedbacks/page'
import { requireAuth } from '@/utils/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/feedbacks')({
    beforeLoad: requireAuth,
    component: FeedbacksPage,
})
