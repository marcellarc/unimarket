import type { LoginResponse } from './auth'

export interface RegisterUserRequest {
    name: string
    email: string
    password: string
}

export type LoginUserResponse = LoginResponse

export interface UserProfile {
    id: number
    name: string
    email: string
    streetAddress?: string | null
    neighborhood?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
    latitude?: number | null
    longitude?: number | null
    locationSource?: string | null
    profileImageUrl?: string | null
    searchRadiusKm?: number | null
    createdAt?: string
}

export interface UpdateUserProfileRequest {
    name?: string
    email?: string
    currentPassword?: string
    password?: string
    streetAddress?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    latitude?: number
    longitude?: number
    locationSource?: string
    profileImageUrl?: string
    searchRadiusKm?: number
}
