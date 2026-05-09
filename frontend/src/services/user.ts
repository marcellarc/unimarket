import { api } from '@/api/client'
import type { RegisterUserRequest, LoginUserResponse, UpdateUserProfileRequest, UserProfile } from '@/types/user'
import type { LoginRequest } from '@/types/auth'

export async function registerUser(data: RegisterUserRequest) {
    const response = await api.post('/auth/register/client', data)
    return response.data
}

export async function loginUser(data: LoginRequest) {
    const response = await api.post<LoginUserResponse>('/auth/login/client', data)
    return response.data
}

export async function getCurrentUserProfile() {
    const response = await api.get<UserProfile>('/clients/me')
    return response.data
}

export async function updateCurrentUserProfile(data: UpdateUserProfileRequest) {
    const response = await api.patch<UserProfile>('/clients/me', data)
    return response.data
}
