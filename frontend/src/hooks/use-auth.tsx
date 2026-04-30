// hooks/useAuth.ts
import Cookies from 'js-cookie'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logoutApi } from '@/services/auth'
import type { LoginRequest, LoginResponse } from '@/types/auth'
import { loginUser } from '@/services/user'
import { loginMarket } from '@/services/supermarket'

const isSecure = import.meta.env.PROD //true em produção, false em dev

type LoginPayload = LoginRequest & { role: 'MARKET' | 'USER' }

const cookieOptions = (days: number) => ({
    expires: days,
    secure: isSecure,
    sameSite: 'strict' as const,
})

export function useAuth() {
    const navigate = useNavigate()

    //salvar sessão
    function saveSession(data: LoginResponse, role: 'MARKET' | 'USER') {
        Cookies.set('accessToken', data.accessToken, cookieOptions(1))
        Cookies.set('refreshToken', data.refreshToken, cookieOptions(7))
        Cookies.set('userRole', role, cookieOptions(1))

        if (role === 'MARKET') {
            Cookies.set('marketName', data.name, cookieOptions(1))
            Cookies.set('marketId', String(data.id), cookieOptions(1))
            Cookies.remove('userName')
            Cookies.remove('userId')
        } else {
            Cookies.set('userName', data.name, cookieOptions(1))
            Cookies.set('userId', String(data.id), cookieOptions(1))
            Cookies.remove('marketName')
            Cookies.remove('marketId')
        }
    }

    //limpar sessão
    function clearSession() {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('marketName')
        Cookies.remove('userName')
        Cookies.remove('marketId')
        Cookies.remove('userId')
        Cookies.remove('userRole')
    }

    //ler sessão
    function getSession() {
        return {
            accessToken: Cookies.get('accessToken'),
            marketName: Cookies.get('marketName'),
            userName: Cookies.get('userName'),
            marketId: Cookies.get('marketId'),
            userId: Cookies.get('userId'),
            userRole: Cookies.get('userRole'),
            isAuthenticated: !!Cookies.get('accessToken'),
        }
    }

    //login
    const { mutate: login, isPending: isLoggingIn } = useMutation({
        mutationFn: ({ role, ...credentials }: LoginPayload) => {

            return role === 'MARKET' ? loginMarket(credentials) : loginUser(credentials)
        },
        onSuccess: (data, variables) => {
            saveSession(data, variables.role)
            toast.success(`Bem-vindo, ${data.name}!`)
            navigate({ to: '/dashboard' })
        },
        onError: (error: any) => {
            const responseData = error.response?.data
            const errorMessage =
                typeof responseData === 'string'
                    ? responseData
                    : responseData?.message ?? responseData?.error ?? 'Erro ao fazer login.'
            toast.error(errorMessage)
        }
    })

    const { mutate: logout, isPending: isLoggingOut } = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            clearSession()
            toast.success('Você saiu com sucesso!')
            navigate({ to: '/login' })
        },
        onError: () => {
            clearSession() // limpa mesmo com erro
            navigate({ to: '/login' })
        }
    })

    return { login, logout, getSession, isLoggingIn, isLoggingOut }
}
