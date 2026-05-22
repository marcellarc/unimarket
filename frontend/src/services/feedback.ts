import { api } from '@/api/client'
import type { FeedbackReplyRequest, FeedbackRequest, FeedbackResponse } from '@/types/feedback'

export async function createFeedback(data: FeedbackRequest) {
    const response = await api.post<FeedbackResponse>('/feedbacks', data)
    return response.data
}

export async function listFeedbacks() {
    const response = await api.get<FeedbackResponse[]>('/feedbacks')
    return response.data
}

export async function listMarketFeedbacks(marketId: number) {
    const response = await api.get<FeedbackResponse[]>(`/markets/${marketId}/feedbacks`)
    return response.data
}

export async function replyFeedback(feedbackId: number, data: FeedbackReplyRequest) {
    const response = await api.put<FeedbackResponse>(`/feedbacks/${feedbackId}/reply`, data)
    return response.data
}
