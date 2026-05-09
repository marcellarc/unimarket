import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { requestPasswordRecovery, resetPassword } from '@/services/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import { Eye, EyeOff, Loader2, Store, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { loginSchema } from './schema'
import type { LoginFormData } from './type'

export function SignInForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [recoveryOpen, setRecoveryOpen] = useState(false)
    const [recoveryEmail, setRecoveryEmail] = useState('')
    const [recoveryCode, setRecoveryCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [codeSent, setCodeSent] = useState(false)
    const [isRecovering, setIsRecovering] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const navigate = useNavigate()
    const { login, isLoggingIn } = useAuth()
    const guestCookieOptions = {
        expires: 1,
        secure: import.meta.env.PROD,
        sameSite: 'strict' as const,
    }


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
    const emailValue = watch('email')

    function onSubmit(data: LoginFormData) {
        login({
            email: data.email,
            password: data.password,
            role: data.role as 'MARKET' | 'USER',
        })
    }

    function handleGuestLogin() {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('marketName')
        Cookies.remove('marketId')

        Cookies.set('userRole', 'GUEST', guestCookieOptions)

        toast.info('Boas-vindas ao modo visitante')
        navigate({ to: '/dashboard' })
    }

    function openRecoveryDialog() {
        setRecoveryEmail(emailValue || '')
        setRecoveryCode('')
        setNewPassword('')
        setCodeSent(false)
        setRecoveryOpen(true)
    }

    async function handleSendRecoveryCode() {
        if (!recoveryEmail) {
            toast.error('Informe seu e-mail')
            return
        }

        try {
            setIsRecovering(true)
            await requestPasswordRecovery(recoveryEmail)
            setCodeSent(true)
            toast.success('Se o e-mail estiver cadastrado, o código foi enviado')
        } catch (error: any) {
            const message = error.response?.data?.message ?? 'Não foi possível solicitar a recuperação'
            toast.error(message)
        } finally {
            setIsRecovering(false)
        }
    }

    async function handleResetPassword() {
        if (!recoveryEmail || !recoveryCode || !newPassword) {
            toast.error('Preencha e-mail, código e nova senha')
            return
        }

        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres')
            return
        }

        try {
            setIsResetting(true)
            await resetPassword({
                email: recoveryEmail,
                code: recoveryCode,
                newPassword,
            })
            toast.success('Senha redefinida com sucesso')
            setRecoveryOpen(false)
        } catch (error: any) {
            const responseData = error.response?.data
            const message =
                typeof responseData === 'string'
                    ? responseData
                    : responseData?.message ?? 'Código inválido ou expirado'
            toast.error(message)
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="flex w-full items-center justify-center py-8 lg:justify-end">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[384px] space-y-5 text-foreground"
            >
                <div className="space-y-2">
                    <h2 className="auth-title whitespace-nowrap text-[2rem] font-extrabold leading-tight text-primary sm:text-[2.35rem]">
                        Bem-vindo de volta!
                    </h2>
                    <p className="auth-support text-sm text-muted-foreground">
                        Acesse sua conta para comparar preços, salvar listas e encontrar mercados próximos.
                    </p>
                </div>

                <div className="flex rounded-full border border-primary/15 bg-slate-100 p-1 shadow-sm dark:bg-white/10">
                    <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${role === 'USER'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                            }`}
                        onClick={() => setValue('role', 'USER')}
                    >
                        <User size={14} /> Usuário
                    </button>

                    <button
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${role === 'MARKET'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                            }`}
                        onClick={() => setValue('role', 'MARKET')}
                    >
                        <Store size={14} /> Supermercado
                    </button>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">E-mail</Label>
                    <Input
                        id="email"
                        placeholder="email@email.com"
                        className="rounded-full border-primary/30 bg-white px-5 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold">Senha</Label>
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <div className="text-left">
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary cursor-pointer"
                        onClick={openRecoveryDialog}
                    >
                        Esqueceu sua senha?
                    </Button>
                </div>

                <Button
                    type="submit"
                    className="w-full cursor-pointer rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    disabled={isLoggingIn}
                >
                    {isLoggingIn ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>

                <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-gray-400">OU</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <Button type="button" variant="outline" className="w-full cursor-pointer rounded-full border-primary/20 bg-white/80 text-foreground hover:border-primary/40 dark:bg-white/10">
                    Continuar com Google
                </Button>

                <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-gray-400">OU</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="text-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={handleGuestLogin}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary cursor-pointer"
                    >
                        Entrar como visitante
                    </Button>
                </div>

                <p className="pt-4 text-center text-xs ">
                    Não tem uma conta?{' '}
                    <Link to="/register">
                        <Button variant="link" className="h-auto p-0 text-xs font-semibold text-[#0056e3] cursor-pointer">
                            Cadastre-se
                        </Button>
                    </Link>
                </p>
            </form>

            <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Recuperar senha</DialogTitle>
                        <DialogDescription>
                            Enviaremos um código para o e-mail cadastrado.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="recoveryEmail">E-mail</Label>
                            <Input
                                id="recoveryEmail"
                                type="email"
                                value={recoveryEmail}
                                onChange={(event) => setRecoveryEmail(event.target.value)}
                                placeholder="email@email.com"
                            />
                        </div>

                        {codeSent && (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="recoveryCode">Código</Label>
                                    <Input
                                        id="recoveryCode"
                                        value={recoveryCode}
                                        onChange={(event) => setRecoveryCode(event.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword">Nova senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRecoveryOpen(false)}>
                            Cancelar
                        </Button>
                        {!codeSent ? (
                            <Button type="button" onClick={handleSendRecoveryCode} disabled={isRecovering}>
                                {isRecovering ? 'Enviando...' : 'Enviar código'}
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleResetPassword} disabled={isResetting}>
                                {isResetting ? 'Redefinindo...' : 'Redefinir senha'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
