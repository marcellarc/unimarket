import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listFeedbacks } from '@/services/feedback'
import type { FeedbackResponse } from '@/types/feedback'

function getReplyKey(feedback: FeedbackResponse) {
    const reply = feedback.marketReply?.trim()

    if (!reply) {
        return ''
    }

    return `${feedback.marketRepliedAt ?? ''}:${reply}`
}

export function useFeedbackReplyNotifications(clientId?: number | null, enabled = true) {
    const seededRef = useRef(false)
    const replyStateByFeedbackId = useRef(new Map<number, string>())

    const canNotify = enabled && !!clientId

    const { data: feedbacks = [] } = useQuery({
        queryKey: ['feedbacks'],
        queryFn: listFeedbacks,
        enabled: canNotify,
        refetchInterval: canNotify ? 15000 : false,
    })

    useEffect(() => {
        if (!canNotify) {
            seededRef.current = false
            replyStateByFeedbackId.current.clear()
            return
        }

        const ownFeedbacks = feedbacks.filter(feedback => feedback.clientId === clientId)

        if (!seededRef.current) {
            ownFeedbacks.forEach(feedback => {
                replyStateByFeedbackId.current.set(feedback.id, getReplyKey(feedback))
            })
            seededRef.current = true
            return
        }

        const currentFeedbackIds = new Set(ownFeedbacks.map(feedback => feedback.id))

        replyStateByFeedbackId.current.forEach((_value, feedbackId) => {
            if (!currentFeedbackIds.has(feedbackId)) {
                replyStateByFeedbackId.current.delete(feedbackId)
            }
        })

        ownFeedbacks.forEach(feedback => {
            const currentReplyKey = getReplyKey(feedback)
            const previousReplyKey = replyStateByFeedbackId.current.get(feedback.id)
            const shouldNotify = Boolean(currentReplyKey) && previousReplyKey !== undefined && previousReplyKey !== currentReplyKey

            replyStateByFeedbackId.current.set(feedback.id, currentReplyKey)

            if (!shouldNotify || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
                return
            }

            new Notification('Mercado respondeu seu feedback', {
                body: `${feedback.marketName} respondeu sobre ${feedback.productName}.`,
                tag: `feedback-reply-${feedback.id}`,
            })
        })
    }, [canNotify, clientId, feedbacks])
}
