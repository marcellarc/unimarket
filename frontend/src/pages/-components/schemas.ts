import { z } from 'zod';

export const loginSchema = z.object({
    role: z.enum(['USER', 'MARKET'], {
        message: 'Selecione um tipo de conta',
    }),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido').toLowerCase(),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').max(100, 'A senha deve ter no máximo 100 caracteres'),
});

// Schema Plano com SuperRefine (A melhor prática para React Hook Form)
export const registerSchema = z.object({
    role: z.enum(['USER', 'MARKET']),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido').toLowerCase(),
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),

    // Todos os campos são opcionais na base (O TypeScript agradece)
    name: z.string().optional(),
    marketName: z.string().optional(),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
}).superRefine((data, ctx) => {
    // Validação de Senhas Iguais
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'As senhas não coincidem',
            path: ['confirmPassword']
        });
    }

    // Validações do USER
    if (data.role === 'USER') {
        if (!data.name || data.name.trim().length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'O nome deve ter no mínimo 3 caracteres',
                path: ['name'] // O erro vai aparecer exatamente no input "name"
            });
        }
    }

    // Validações do MARKET
    if (data.role === 'MARKET') {
        if (!data.marketName || data.marketName.trim().length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'O nome do supermercado deve ter no mínimo 3 caracteres',
                path: ['marketName'] // O erro vai aparecer no input "marketName"
            });
        }
        if (!data.cnpj || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CNPJ inválido (Ex: 00.000.000/0000-00)',
                path: ['cnpj']
            });
        }

    }
    if (!data.phone || !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(data.phone)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Telefone inválido (Ex: (11) 90000-0000)',
            path: ['phone']
        });
    }
}
);

// Inferimos o tipo diretamente do Zod
export type RegisterFormData = z.infer<typeof registerSchema>;