export interface FeedbackResponse {
    id: number
    clientId: number
    clientName: string
    productId: number
    productName: string
    marketId: number
    marketName: string
    vlNota: number
    dsComentario: string
    marketReply?: string | null
    marketRepliedAt?: string | null
    createdAt?: string | null
}

export interface FeedbackRequest {
    clientId: number
    productId: number
    marketId: number
    vlNota: number
    dsComentario: string
}

export interface FeedbackReplyRequest {
    reply: string
}
