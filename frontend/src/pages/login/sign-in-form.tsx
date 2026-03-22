import { zodResolver } from '@hookform/resolvers/zod'
// 1. Importe o Loader2 do lucide-react
import { Eye, EyeOff, User, Store, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema } from './schema'
import type { LoginFormData } from './type'
import { Button, Input, Label } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'

const mockUsers = [
    {
        role: 'USER',
        email: 'user@unimarket.com',
        password: '123456',
        redirect: '/dashboard'
    },
    {
        role: 'MARKET',
        email: 'market@unimarket.com',
        password: '123456',
        redirect: '/dashboard'
    }
]

export function SignInForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            role: 'USER',
        },
    })

    const role = watch('role')

    // 2. Transforme a função em async
    async function onSubmit(data: LoginFormData) {
        setLoading(true)

        try {
            // Delay artificial de 1.5 segundos para ver a animação funcionando
            await new Promise(resolve => setTimeout(resolve, 1500))

            const user = mockUsers.find(
                (u) =>
                    u.email === data.email &&
                    u.password === data.password &&
                    u.role === data.role
            )

            if (!user) {
                alert('Credenciais inválidas')
                return
            }

            // salvar sessão
            localStorage.setItem('authToken', 'mock-token')
            localStorage.setItem('userType', user.role)

            navigate({ to: '/dashboard' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-full items-center justify-center bg-white px-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-5 text-foreground"
            >
                <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
                    Faça login
                </h2>

                {/* Usuário / Supermercado */}
                <div className="flex rounded-full bg-gray-100 p-1">
                    <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${role === 'USER'
                            ? 'bg-primary text-primary-foreground shadow-sm' // Uso do primary dinâmico!
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setValue('role', 'USER')}
                    >
                        <User size={16} /> Usuário
                    </button>

                    <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${role === 'MARKET'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-gray-500 hover:text-foreground'
                            }`}
                        onClick={() => setValue('role', 'MARKET')}
                    >
                        <Store size={16} /> Supermercado
                    </button>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">E-mail</Label>
                    <Input
                        id="email"
                        placeholder="email@email.com"
                        className="border-blue-400"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Senha */}
                <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold ">Senha</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="border-blue-400"
                            placeholder="********"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Esqueceu a senha alinhado à esquerda */}
                <div className="text-left">
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary cursor-pointer" // text-primary
                    >
                        Esqueceu sua senha?
                    </Button>
                </div>

                {/* 3. Botão Entrar atualizado com o Loader girando */}
                <Button
                    type="submit"
                    className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>

                {/* Primeiro Divider (OU) */}
                <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-gray-400">OU</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Continuar com Google */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer border-gray-300 text-foreground"
                >
                    Continuar com Google
                </Button>

                {/* Segundo Divider (OU) */}
                <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-gray-400">OU</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Continue como convidado */}
                <div className="text-center">
                    <Link to="/dashboard">
                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            Continue como convidado
                        </Button>
                    </Link>
                </div>

                {/* Cadastro */}
                <p className="pt-4 text-center text-xs ">
                    Não tem uma conta?{' '}
                    <Link to="/register">
                        <Button variant="link" className="h-auto p-0 text-xs font-semibold text-[#0056e3] cursor-pointer">
                            Cadastre-se
                        </Button>
                    </Link>
                </p>

                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                    <p><strong>Usuário:</strong> user@unimarket.com / 123456</p>
                    <p><strong>Supermercado:</strong> market@unimarket.com / 123456</p>
                </div>
            </form>
        </div>
    )
}