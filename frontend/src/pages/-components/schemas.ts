import { z } from 'zod';

const passwordRule = z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial')

export const loginSchema = z.object({
    role: z.enum(['USER', 'MARKET'], {
        message: 'Selecione um tipo de conta',
    }),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido').toLowerCase(),
    password: z.string().min(1, 'Senha é obrigatória').max(100, 'A senha deve ter no máximo 100 caracteres'),
});

// Schema Plano com SuperRefine (A melhor prática para React Hook Form)
export const registerSchema = z.object({
    role: z.enum(['USER', 'MARKET']),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido').toLowerCase(),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),

    // Todos os campos são opcionais na base (O TypeScript agradece)
    name: z.string().optional(),
    marketName: z.string().optional(),
    cnpj: z.string().optional(),
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
        if (!data.name || data.name.trim().length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'O nome deve ter no mínimo 2 caracteres',
                path: ['name'] // O erro vai aparecer exatamente no input "name"
            });
        } else if (data.name.trim().length > 14) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'O nome deve ter no máximo 14 caracteres',
                path: ['name']
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

}
);


export type RegisterFormData = z.infer<typeof registerSchema>;

export const productSchema = z.object({
    productName: z.string().min(1, 'Nome do produto é obrigatório'),
    brand: z.string().min(1, 'Marca é obrigatória'),
    description: z.string(),
    imageUrl: z.string().url('Insira uma URL válida').or(z.literal('')),
    categoryId: z.number().min(1, 'Selecione uma categoria'),
    barCode: z.string()
        .regex(/^\d{13}$/, 'Deve conter exatamente 13 dígitos numéricos')
        .or(z.literal(''))
        .transform(val => val === '' ? null : val)
        .nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const marketProductSchema = z.object({
    productName: z.string().min(2, 'Nome obrigatório'),
    brand: z.string().min(1, 'Marca obrigatória'),
    description: z.string().optional(),
    imageUrl: z.string().url('URL inválida').or(z.literal('')).optional(),
    categoryId: z.number().min(1, 'Selecione uma categoria válida'),
    barCode: z.string().regex(/^\d{8,14}$/, 'Use de 8 a 14 dígitos').or(z.literal('')).optional(),
    price: z.number({ message: 'Informe o preço' }).min(0.01, 'Preço deve ser maior que zero'),
    stockQuantity: z.number({ message: 'Informe o estoque' }).int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo'),
})

export type MarketProductFormData = z.infer<typeof marketProductSchema>
