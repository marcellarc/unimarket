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
    createdAt?: string
}

export interface UpdateUserProfileRequest {
    name?: string
    email?: string
    password?: string
}
