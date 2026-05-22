export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    id: number
    name: string
    email: string
    accessToken: string
    refreshToken: string
}

export interface GoogleLoginRequest {
    idToken: string
}
