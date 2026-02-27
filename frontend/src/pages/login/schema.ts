import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),

  password: z
    .string()
    .min(6, 'Mínimo de 6 caracteres'),

  role: z.enum(['USER', 'MARKET']),
})