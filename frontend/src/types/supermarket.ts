import type { LoginResponse } from './auth'

export interface RegisterMarketRequest {
    name: string
    cnpj: string
    email: string
    password: string
    streetAddress?: string
    neighborhood?: string
}

export type LoginMarketResponse = LoginResponse
