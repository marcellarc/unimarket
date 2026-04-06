import { api } from "@/api/client";

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


export async function logoutApi() {
    // Faz a chamada POST para a rota de logout que criamos no Spring Boot
    const response = await api.post('/api/auth/logout');
    return response.data;
}