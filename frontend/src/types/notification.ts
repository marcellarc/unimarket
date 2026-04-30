export interface PriceAlertRequest {
    marketProductId: number
    desiredPrice: number
}

export interface PriceAlertResponse {
    id: number
    marketProductId: number
    productName: string
    marketName: string
    desiredPrice: number
    currentPrice: number | null
    active: boolean
    createdAt: string
    notifiedAt: string | null
}

export interface PriceNotificationResponse {
    id: number
    marketProductId: number
    productName: string
    marketName: string
    title: string
    message: string
    targetPrice: number
    currentPrice: number
    read: boolean
    createdAt: string
}

export interface UnreadNotificationCount {
    unreadCount: number
}
