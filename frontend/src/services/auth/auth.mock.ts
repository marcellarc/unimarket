// src/services/auth/auth.mock.ts
import type { LoginInput, LoginResponse } from './auth.types'

const MOCK_USER = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  createdAt: new Date().toISOString(),
}

export async function loginMock(
  data: LoginInput,
): Promise<LoginResponse> {
  // simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (data.email !== 'joao@email.com' || data.password !== 'senha123') {
    throw new Error('Email ou senha inválidos')
  }

  return {
    user: MOCK_USER,
    token: 'mock-jwt-token',
  }
}