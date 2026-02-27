// src/services/auth/auth.types.ts
import type { User } from '@/types/api'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}