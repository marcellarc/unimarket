import type { LoginResponse } from './auth'

export interface RegisterUserRequest {
    name: string
    email: string
    password: string
}

export type LoginUserResponse = LoginResponse
