import { api } from '@/api/client'
import type {
    PriceAlertRequest,
    PriceAlertResponse,
    PriceNotificationResponse,
    UnreadNotificationCount,
} from '@/types/notification'

export async function createPriceAlert(data: PriceAlertRequest) {
    const response = await api.post<PriceAlertResponse>('/price-alerts', data)
    return response.data
}

export async function listPriceAlerts() {
    const response = await api.get<PriceAlertResponse[]>('/price-alerts')
    return response.data
}

export async function deactivatePriceAlert(alertId: number) {
    await api.delete(`/price-alerts/${alertId}`)
}

export async function listNotifications() {
    const response = await api.get<PriceNotificationResponse[]>('/notifications')
    return response.data
}

export async function countUnreadNotifications() {
    const response = await api.get<UnreadNotificationCount>('/notifications/unread-count')
    return response.data
}

export async function markNotificationsAsRead() {
    await api.patch('/notifications/read')
}
