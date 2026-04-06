import { api } from "@/api/client"
import type { LoginRequest, LoginResponse } from "./auth"

export interface RegisterMarketRequest {
    name: string
    cnpj: string
    email: string
    password: string
    streetAddress?: string
    neighborhood?: string
}

export async function registerMarket(data: RegisterMarketRequest) {
    const response = await api.post('/api/auth/register/market', data)
    return response.data
}

export async function loginMarket(data: LoginRequest) {
    const response = await api.post<LoginResponse>('/api/auth/login/market', data)
    return response.data
}