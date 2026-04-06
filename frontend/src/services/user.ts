import { api } from "@/api/client"
import type { LoginRequest, LoginResponse } from "./auth"

export interface RegisterUserRequest {
    name: string
    email: string
    password: string
}

export async function registerUser(data: RegisterUserRequest) {
    const response = await api.post('/api/auth/register/client', data)
    return response.data
}

export async function loginUser(data: LoginRequest) {
    const response = await api.post<LoginResponse>('/api/auth/login/client', data)
    return response.data
}