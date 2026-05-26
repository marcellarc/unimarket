import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório'),

  password: z
    .string()
  ,

  role: z.enum(['USER', 'MARKET', 'GUEST']),
})
