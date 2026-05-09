import { api } from '@/api/client'
import type {
    RegisterMarketRequest,
    LoginMarketResponse,
    MarketResponse,
    NearbyMarketSearchParams,
    UpdateMarketProfileRequest,
} from '@/types/supermarket'
import type { LoginRequest } from '@/types/auth'

export async function registerMarket(data: RegisterMarketRequest) {
    const response = await api.post('/api/auth/register/market', data)
    return response.data
}

export async function loginMarket(data: LoginRequest) {
    const response = await api.post<LoginMarketResponse>('/api/auth/login/market', data)
    return response.data
}

export async function listNearbyMarkets(params: NearbyMarketSearchParams) {
    const response = await api.get<MarketResponse[]>('/api/markets/nearby', { params })
    return response.data
}

export async function getCurrentMarketProfile() {
    const response = await api.get<MarketResponse>('/api/markets/me')
    return response.data
}

export async function updateCurrentMarketProfile(data: UpdateMarketProfileRequest) {
    const response = await api.patch<MarketResponse>('/api/markets/me', data)
    return response.data
}

export async function syncCurrentMarketProfileFromCnpj() {
    const response = await api.post<MarketResponse>('/api/markets/me/sync-cnpj')
    return response.data
}
