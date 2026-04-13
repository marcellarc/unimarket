import { api } from '@/api/client'
import type { RegisterMarketRequest, LoginMarketResponse } from '@/types/supermarket'
import type { LoginRequest } from '@/types/auth'

export async function registerMarket(data: RegisterMarketRequest) {
    const response = await api.post('/api/auth/register/market', data)
    return response.data
}

export async function loginMarket(data: LoginRequest) {
    const response = await api.post<LoginMarketResponse>('/api/auth/login/market', data)
    return response.data
}
