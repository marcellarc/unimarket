import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório'),

  password: z
    .string()
  ,

  role: z.enum(['USER', 'MARKET', 'GUEST']),
})