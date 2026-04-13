export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    id: number
    name: string
    email: string
    password: string
    accessToken: string
    refreshToken: string
}
