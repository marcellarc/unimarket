import { api } from '@/api/client'

export async function logoutApi() {
    const response = await api.post('/api/auth/logout')
    return response.data
}
