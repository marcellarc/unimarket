import { Button, Input, Label } from '@/components/ui'
import { useRegister } from '@/hooks/use-register'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import { Building2, CheckCircle2, Eye, EyeOff, FileText, Loader2, Store, User, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { registerSchema } from '../-components/schemas'
import type { RegisterFormData } from '../-components/type'

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const { submit, isPending } = useRegister()

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
    const password = watch('password') ?? ''
    const passwordRules = [
        { label: '8 caracteres', valid: password.length >= 8 },
        { label: 'Maiúscula', valid: /[A-Z]/.test(password) },
        { label: 'Minúscula', valid: /[a-z]/.test(password) },
        { label: 'Número', valid: /\d/.test(password) },
        { label: 'Símbolo', valid: /[^A-Za-z0-9]/.test(password) },
    ]

    function onSubmit(data: RegisterFormData) {
        submit(data)
    }

    function handleGuestLogin() {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('marketName')
        Cookies.remove('marketId')
        Cookies.set('userRole', 'GUEST', {
            expires: 1,
            secure: import.meta.env.PROD,
            sameSite: 'strict' as const,
        })
        toast.info('Boas-vindas ao modo visitante')
        navigate({ to: '/dashboard' })
    }

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

    return (
        <div className="flex w-full min-w-0 items-center justify-center py-8">
            <form
                onSubmit={handleSubmit(onSubmit, (errosDoZod) => {
                    console.log("O Zod bloqueou o envio! Veja os erros:", errosDoZod)
                })}
                className="auth-form w-full min-w-0 max-w-[384px] space-y-5 text-foreground"
            >
                <div className="space-y-2">
                    <h2 className="auth-title whitespace-nowrap text-[2rem] font-extrabold leading-tight text-primary sm:text-[2.35rem]">
                        Crie sua conta
                    </h2>
                    <p className="auth-support text-[0.9375rem] leading-relaxed text-muted-foreground">
                        Entre como cliente ou cadastre seu supermercado no UniMarket.
                    </p>
                </div>


                <div className="auth-role-toggle flex min-w-0 rounded-full border border-primary/15 bg-slate-100 p-1 shadow-sm dark:bg-white/10">
                    <button
                        type="button"
                        className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${role === 'USER'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                            }`}
                        onClick={() => setValue('role', 'USER')}
                    >
                        <User size={14} /> Usuário
                    </button>

                    <button
                        type="button"
                        className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${role === 'MARKET'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                            }`}
                        onClick={() => setValue('role', 'MARKET')}
                    >
                        <Store size={14} /> Supermercado
                    </button>
                </div>


                {role === 'USER' && (
                    <>
                        <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Nome completo
                            </Label>
                            <div className="relative">
                                <UserCircle
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="name"
                                    placeholder="O seu nome completo"
                                    className="rounded-full border-primary/30 bg-white pl-10 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                                    {...register('name')}
                                />
                            </div>
                            {errors.name?.message && (
                                <p className="text-xs text-destructive">
                                    {errors.name.message as string}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {role === 'MARKET' && (
                    <>
                        <div className="space-y-1">
                            <Label htmlFor="marketName" className="text-xs font-semibold">
                                Nome do supermercado
                            </Label>
                            <div className="relative">
                                <Building2
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="marketName"
                                    placeholder="Nome do estabelecimento"
                                    className="rounded-full border-primary/30 bg-white pl-10 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                                    {...register('marketName')}
                                />
                            </div>
                            {errors.marketName?.message && (
                                <p className="text-xs text-destructive">
                                    {errors.marketName.message as string}
                                </p>
                            )}
                        </div>

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
                                    className="rounded-full border-primary/30 bg-white pl-10 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                                    {...register('cnpj')}
                                    onChange={(e) => {
                                        const formatted = formatCNPJ(e.target.value)
                                        e.target.value = formatted
                                    }}
                                    maxLength={18}
                                />
                            </div>
                            {errors.cnpj?.message && (
                                <p className="text-xs text-destructive">
                                    {errors.cnpj.message as string}
                                </p>
                            )}
                        </div>





                    </>
                )}


                <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">
                        E-mail
                    </Label>
                    <Input
                        id="email"
                        placeholder={role === 'MARKET' ? "email@supermercado.com" : "email@email.com"}
                        className="rounded-full border-primary/30 bg-white px-5 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                        {...register('email')}
                    />
                    {errors.email?.message && (
                        <p className="text-xs text-destructive">
                            {errors.email.message as string}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold">
                        Senha
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="rounded-full border-primary/30 bg-white px-5 pr-11 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                            placeholder="********"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password?.message && (
                        <p className="text-xs text-destructive">
                            {errors.password.message as string}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-3">
                        {passwordRules.map(rule => (
                            <span
                                key={rule.label}
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${rule.valid
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border bg-white/70 text-muted-foreground dark:bg-white/10'
                                    }`}
                            >
                                <CheckCircle2 className="h-3 w-3" />
                                {rule.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                        Confirmar senha
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="rounded-full border-primary/30 bg-white px-5 pr-11 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                            placeholder="********"
                            {...register('confirmPassword')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword?.message && (
                        <p className="text-xs text-destructive">
                            {errors.confirmPassword.message as string}
                        </p>
                    )}
                </div>


                <Button
                    type="submit"
                    className="w-full cursor-pointer rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        'Criar conta'
                    )}
                </Button>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>OU</span>
                    <div className="h-px flex-1 bg-border" />
                </div>


                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer rounded-full border-primary/20 bg-white/80 text-foreground hover:border-primary/40 dark:bg-white/10"
                >
                    Continuar com Google
                </Button>


                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>OU</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="text-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={handleGuestLogin}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                        Entrar como visitante
                    </Button>
                </div>

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
