import { z } from 'zod';

// Schema de Login
export const loginSchema = z.object({
    role: z.enum(['USER', 'MARKET'], {
        message: 'Selecione um tipo de conta',
    }),
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido')
        .toLowerCase(),
    password: z
        .string()
        .min(6, 'A senha deve ter no mínimo 6 caracteres')
        .max(100, 'A senha deve ter no máximo 100 caracteres'),
});

// Schema de Registro - simplificado com campos opcionais
export const registerSchema = z.object({
    role: z.enum(['USER', 'MARKET']),
    // Campos para USER
    name: z.string().optional(),
    // Campos para MARKET
    marketName: z.string().optional(),
    cnpj: z.string().optional(),
    responsibleName: z.string().optional(),
    phone: z.string().optional(),
    // Campos comuns
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido')
        .toLowerCase(),
    password: z
        .string()
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .max(100, 'A senha deve ter no máximo 100 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
}).refine((data) => {
    // Valida campos específicos do USER
    if (data.role === 'USER') {
        if (!data.name || data.name.length < 3) {
            return false;
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(data.name)) {
            return false;
        }
    }
    return true;
}, {
    message: 'Nome deve ter no mínimo 3 caracteres e conter apenas letras',
    path: ['name'],
}).refine((data) => {
    // Valida campos específicos do MARKET
    if (data.role === 'MARKET') {
        if (!data.marketName || data.marketName.length < 3) {
            return false;
        }
        if (!data.cnpj || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
            return false;
        }
        if (!data.responsibleName || data.responsibleName.length < 3) {
            return false;
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(data.responsibleName)) {
            return false;
        }
        if (!data.phone || !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(data.phone)) {
            return false;
        }
    }
    return true;
}, {
    message: 'Preencha todos os campos obrigatórios corretamente',
    path: ['marketName'],
});
