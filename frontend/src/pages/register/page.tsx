import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
//import { api } from '@/api';
import { Button, Input, Label } from '@/components/ui';
import { toast } from 'sonner';

// Schema de validação com Zod - Validação reforçada
const registerSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres')
            .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
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
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    /*const onSubmit = async (data: RegisterFormData) => {
      setIsLoading(true);
      try {
        const user = await api.register({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Cadastro realizado com sucesso!');
        // Navegar para dashboard (será implementado depois)
        console.log('Usuário cadastrado:', user);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao fazer cadastro');
      } finally {
        setIsLoading(false);
      }
    };*/

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
                {/* Lado esquerdo - Informação */}
                <div className="hidden md:flex flex-col justify-center space-y-6 p-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                            <ShoppingCart className="size-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            UniMarket
                        </h1>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800">
                        Junte-se a nós!
                    </h2>

                    <p className="text-lg text-gray-600">
                        Crie sua conta gratuitamente e comece a economizar em suas compras hoje mesmo.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg mt-1">
                                <div className="size-2 bg-emerald-600 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">100% Gratuito</h3>
                                <p className="text-sm text-gray-600">Sem taxas ocultas ou mensalidades</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                <div className="size-2 bg-blue-600 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Dados Seguros</h3>
                                <p className="text-sm text-gray-600">Suas informações são protegidas</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg mt-1">
                                <div className="size-2 bg-purple-600 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Acesso Instantâneo</h3>
                                <p className="text-sm text-gray-600">Comece a usar imediatamente</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado direito - Formulário */}
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-md shadow-2xl border-0">
                        <CardHeader className="space-y-1 pb-6">
                            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
                                <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-xl">
                                    <ShoppingCart className="size-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                    UniMarket
                                </h1>
                            </div>
                            <CardTitle className="text-2xl">Criar Conta</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para criar sua conta
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Seu nome"
                                            {...register('name')}
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            {...register('email')}
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('password')}
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Mínimo 8 caracteres com letras maiúsculas, minúsculas, números e símbolos
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('confirmPassword')}
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Ou cadastre-se com</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                                    <svg className="mr-2 size-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>

                                <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
                                    <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                    GitHub
                                </Button>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-center">
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                >
                                    Fazer login
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
