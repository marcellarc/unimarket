import { api } from '@/api/client'

export async function logoutApi() {
    const response = await api.post('/api/auth/logout')
    return response.data
}

export async function requestPasswordRecovery(email: string) {
    const response = await api.post('/api/auth/password/recover', { email })
    return response.data
}

export async function resetPassword(data: { email: string; code: string; newPassword: string }) {
    const response = await api.post('/api/auth/password/reset', data)
    return response.data
}
