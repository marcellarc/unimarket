import { api } from '@/api/client'
import type {
    PriceAlertRequest,
    PriceAlertResponse,
    PriceNotificationResponse,
    UnreadNotificationCount,
} from '@/types/notification'

export async function createPriceAlert(data: PriceAlertRequest) {
    const response = await api.post<PriceAlertResponse>('/api/price-alerts', data)
    return response.data
}

export async function listPriceAlerts() {
    const response = await api.get<PriceAlertResponse[]>('/api/price-alerts')
    return response.data
}

export async function deactivatePriceAlert(alertId: number) {
    await api.delete(`/api/price-alerts/${alertId}`)
}

export async function listNotifications() {
    const response = await api.get<PriceNotificationResponse[]>('/api/notifications')
    return response.data
}

export async function countUnreadNotifications() {
    const response = await api.get<UnreadNotificationCount>('/api/notifications/unread-count')
    return response.data
}

export async function markNotificationsAsRead() {
    await api.patch('/api/notifications/read')
}
