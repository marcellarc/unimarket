import type { z } from 'zod';
import type { loginSchema, registerSchema } from './schemas';

// Tipos inferidos dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Tipo para o role
export type UserRole = 'USER' | 'MARKET';

// Tipos específicos para cada tipo de usuário
export interface UserRegisterData {
    role: 'USER';
    name: string;
    email: string;
    password: string;
}

export interface MarketRegisterData {
    role: 'MARKET';
    marketName: string;
    cnpj: string;
    phone: string;
    email: string;
    password: string;
}