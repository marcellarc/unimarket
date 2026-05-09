import type { LoginResponse } from './auth'

export interface RegisterMarketRequest {
    name: string
    cnpj: string
    email: string
    password: string
    streetAddress?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
}

export type LoginMarketResponse = LoginResponse

export interface NearbyMarketSearchParams {
    latitude?: number
    longitude?: number
    city?: string
    state?: string
    radiusKm?: number
}

export interface MarketResponse {
    id: number
    name: string
    officialName?: string | null
    tradeName?: string | null
    registrationStatus?: string | null
    mainActivity?: string | null
    cnpj: string
    email?: string | null
    streetAddress?: string | null
    neighborhood?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    latitude?: number | null
    longitude?: number | null
    distanceKm?: number | null
    hasCoordinates: boolean
    addressSource?: string | null
    googleMapsUrl: string
    directionsUrl: string
    createdAt: string
}

export interface UpdateMarketProfileRequest {
    name?: string
    email?: string
    streetAddress?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
    password?: string
}
