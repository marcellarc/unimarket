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
    const response = await api.post('/auth/register/market', data)
    return response.data
}

export async function loginMarket(data: LoginRequest) {
    const response = await api.post<LoginMarketResponse>('/auth/login/market', data)
    return response.data
}

export async function listNearbyMarkets(params: NearbyMarketSearchParams) {
    const response = await api.get<MarketResponse[]>('/markets/nearby', { params })
    return response.data
}

export async function getCurrentMarketProfile() {
    const response = await api.get<MarketResponse>('/markets/me')
    return response.data
}

export async function updateCurrentMarketProfile(data: UpdateMarketProfileRequest) {
    const response = await api.patch<MarketResponse>('/markets/me', data)
    return response.data
}

export async function syncCurrentMarketProfileFromCnpj() {
    const response = await api.post<MarketResponse>('/markets/me/sync-cnpj')
    return response.data
}

export async function deleteMarketAccount(marketId: number) {
    await api.delete(`/markets/${marketId}`)
}
