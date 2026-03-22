import { zodResolver } from '@hookform/resolvers/zod'
// 1. Adicionado o Loader2
import { Eye, EyeOff, User, Store, Building2, Phone, FileText, UserCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input, Label } from '@/components/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { RegisterFormData } from '../-components/type'
import { registerSchema } from '../-components/schemas'

export function SignUpForm() {
    console.log('SignUpForm rendering');

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'USER',
        },
    })

    const role = watch('role')

    async function onSubmit(data: RegisterFormData) {
        setLoading(true)

        try {
            // simula delay de requisição para vermos a animação
            await new Promise((resolve) => setTimeout(resolve, 1500))

            const { confirmPassword, ...registerData } = data

            const mockUser = {
                id: Date.now(),
                ...registerData,
            }

            console.log('Usuário cadastrado (mock):', mockUser)

            localStorage.setItem('mockUser', JSON.stringify(mockUser))

            toast.success('Cadastro realizado com sucesso!')

            // Opcional: Redirecionar para o login após cadastro com sucesso
            // navigate({ to: '/login' })

        } catch {
            toast.error('Erro ao fazer cadastro')
        } finally {
            setLoading(false)
        }
    }

    // Função para formatar CNPJ
    function formatCNPJ(value: string) {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 14) {
            return numbers
                .replace(/^(\d{2})(\d)/, '$1.$2')
                .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
        }
        return value
    }

    // Função para formatar telefone
    function formatPhone(value: string) {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
        }
        return value
    }

    return (
        <div className="flex h-full items-center justify-center bg-background px-6 py-8">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-5 text-foreground"
            >
                <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
                    Cadastre-se
                </h2>

                {/* Usuário / Supermercado (Usando cores semânticas) */}
                <div className="flex rounded-full bg-secondary p-1">
                    <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${role === 'USER'
                                ? 'bg-primary text-primary-foreground shadow-sm'
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
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setValue('role', 'MARKET')}
                    >
                        <Store size={16} /> Supermercado
                    </button>
                </div>

                {/* Campos para USUÁRIO */}
                {role === 'USER' && (
                    <>
                        {/* Nome */}
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Nome Completo
                            </Label>
                            <div className="relative">
                                <UserCircle
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="name"
                                    placeholder="Seu nome completo"
                                    className="border-primary/30 pl-10 focus-visible:ring-primary"
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && 'message' in errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                placeholder="email@email.com"
                                className="border-primary/30 focus-visible:ring-primary"
                                {...register('email')}
                            />
                            {errors.email && 'message' in errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Senha */}
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="border-primary/30 focus-visible:ring-primary"
                                    placeholder="********"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && 'message' in errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Mín. 8 caracteres com maiúsculas, minúsculas, números e símbolos
                            </p>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                                Confirmar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="border-primary/30 focus-visible:ring-primary"
                                    placeholder="********"
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && 'message' in errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Campos para SUPERMERCADO */}
                {role === 'MARKET' && (
                    <>
                        {/* Nome do Supermercado */}
                        <div className="space-y-1">
                            <Label htmlFor="marketName" className="text-xs font-semibold">
                                Nome do Supermercado
                            </Label>
                            <div className="relative">
                                <Building2
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="marketName"
                                    placeholder="Nome do estabelecimento"
                                    className="border-primary/30 pl-10 focus-visible:ring-primary"
                                    {...register('marketName')}
                                />
                            </div>
                            {errors.marketName && 'message' in errors.marketName && (
                                <p className="text-xs text-destructive">
                                    {errors.marketName.message}
                                </p>
                            )}
                        </div>

                        {/* CNPJ */}
                        <div className="space-y-1">
                            <Label htmlFor="cnpj" className="text-xs font-semibold">
                                CNPJ
                            </Label>
                            <div className="relative">
                                <FileText
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="cnpj"
                                    placeholder="00.000.000/0000-00"
                                    className="border-primary/30 pl-10 focus-visible:ring-primary"
                                    {...register('cnpj')}
                                    onChange={(e) => {
                                        const formatted = formatCNPJ(e.target.value)
                                        e.target.value = formatted
                                    }}
                                    maxLength={18}
                                />
                            </div>
                            {errors.cnpj && 'message' in errors.cnpj && (
                                <p className="text-xs text-destructive">
                                    {errors.cnpj.message}
                                </p>
                            )}
                        </div>

                        {/* Nome do Responsável */}
                        <div className="space-y-1">
                            <Label htmlFor="responsibleName" className="text-xs font-semibold">
                                Nome do Responsável
                            </Label>
                            <div className="relative">
                                <UserCircle
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="responsibleName"
                                    placeholder="Nome completo do responsável"
                                    className="border-primary/30 pl-10 focus-visible:ring-primary"
                                    {...register('responsibleName')}
                                />
                            </div>
                            {errors.responsibleName && 'message' in errors.responsibleName && (
                                <p className="text-xs text-destructive">
                                    {errors.responsibleName.message}
                                </p>
                            )}
                        </div>

                        {/* Telefone */}
                        <div className="space-y-1">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                Telefone
                            </Label>
                            <div className="relative">
                                <Phone
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    className="border-primary/30 pl-10 focus-visible:ring-primary"
                                    {...register('phone')}
                                    onChange={(e) => {
                                        const formatted = formatPhone(e.target.value)
                                        e.target.value = formatted
                                    }}
                                    maxLength={15}
                                />
                            </div>
                            {errors.phone && 'message' in errors.phone && (
                                <p className="text-xs text-destructive">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                placeholder="email@supermercado.com"
                                className="border-primary/30 focus-visible:ring-primary"
                                {...register('email')}
                            />
                            {errors.email && 'message' in errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Senha */}
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="border-primary/30 focus-visible:ring-primary"
                                    placeholder="********"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && 'message' in errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Mín. 8 caracteres com maiúsculas, minúsculas, números e símbolos
                            </p>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                                Confirmar Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="border-primary/30 focus-visible:ring-primary"
                                    placeholder="********"
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && 'message' in errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* 2. Botão Cadastrar atualizado com a Animação e Cores Oficiais */}
                <Button
                    type="submit"
                    className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cadastrando...
                        </>
                    ) : (
                        'Cadastrar'
                    )}
                </Button>

                {/* Primeiro Divider (OU) */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>OU</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* Continuar com Google */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer border-border text-foreground hover:bg-secondary"
                >
                    Continuar com Google
                </Button>

                {/* Segundo Divider (OU) */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>OU</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* Continue como convidado */}
                <div className="text-center">
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                        Continue como convidado
                    </Button>
                </div>

                {/* Login */}
                <p className="pt-4 text-center text-xs text-foreground">
                    Já tem uma conta?{' '}
                    <Link to="/login">
                        <Button
                            variant="link"
                            className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer"
                        >
                            Faça login
                        </Button>
                    </Link>
                </p>
            </form>
        </div>
    )
}