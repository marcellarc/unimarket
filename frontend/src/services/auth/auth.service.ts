// src/services/auth/auth.service.ts
import type { LoginInput, LoginResponse } from './auth.types'
import { loginMock } from './auth.mock'

// depois você troca isso por axios/fetch
const USE_MOCK = true

async function login(data: LoginInput): Promise<LoginResponse> {
  if (USE_MOCK) {
    return loginMock(data)
  }

  // FUTURO:
  // return api.post('/auth/login', data).then(res => res.data)

  throw new Error('API não implementada')
}

export const authService = {
  login,
}