import { api } from '@/api/client'
import type { RegisterUserRequest, LoginUserResponse, UpdateUserProfileRequest, UserProfile } from '@/types/user'
import type { LoginRequest } from '@/types/auth'

export async function registerUser(data: RegisterUserRequest) {
    const response = await api.post('/api/auth/register/client', data)
    return response.data
}

export async function loginUser(data: LoginRequest) {
    const response = await api.post<LoginUserResponse>('/api/auth/login/client', data)
    return response.data
}

export async function getCurrentUserProfile() {
    const response = await api.get<UserProfile>('/api/clients/me')
    return response.data
}

export async function updateCurrentUserProfile(data: UpdateUserProfileRequest) {
    const response = await api.patch<UserProfile>('/api/clients/me', data)
    return response.data
}
