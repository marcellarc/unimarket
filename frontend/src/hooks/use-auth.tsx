import Cookies from 'js-cookie'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { loginGoogleUser, logoutApi } from '@/services/auth'
import type { LoginRequest, LoginResponse } from '@/types/auth'
import { loginUser } from '@/services/user'
import { loginMarket } from '@/services/supermarket'
import { getApiErrorMessage } from '@/lib/api-error'
import { clearSessionState } from '@/utils/session'

const isSecure = import.meta.env.PROD

type LoginPayload = LoginRequest & { role: 'MARKET' | 'USER' }

const cookieOptions = (days: number) => ({
    expires: days,
    secure: isSecure,
    sameSite: 'strict' as const,
})

export function useAuth() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    function saveSession(data: LoginResponse, role: 'MARKET' | 'USER') {
        clearSessionState()
        queryClient.clear()

        Cookies.set('accessToken', data.accessToken, cookieOptions(1))
        Cookies.set('refreshToken', data.refreshToken, cookieOptions(7))
        Cookies.set('userRole', role, cookieOptions(1))

        if (role === 'MARKET') {
            Cookies.set('marketName', data.name, cookieOptions(1))
            Cookies.set('marketId', String(data.id), cookieOptions(1))
            Cookies.set('marketEmail', data.email, cookieOptions(1))
        } else {
            Cookies.set('userName', data.name, cookieOptions(1))
            Cookies.set('userId', String(data.id), cookieOptions(1))
            Cookies.set('userEmail', data.email, cookieOptions(1))
        }
    }

    function clearSession() {
        clearSessionState()
        queryClient.clear()
    }

    function getSession() {
        return {
            accessToken: Cookies.get('accessToken'),
            marketName: Cookies.get('marketName'),
            userName: Cookies.get('userName'),
            userEmail: Cookies.get('userEmail'),
            marketEmail: Cookies.get('marketEmail'),
            marketId: Cookies.get('marketId'),
            userId: Cookies.get('userId'),
            userRole: Cookies.get('userRole'),
            isAuthenticated: !!Cookies.get('accessToken'),
        }
    }

    const { mutate: login, isPending: isLoggingIn } = useMutation({
        mutationFn: ({ role, ...credentials }: LoginPayload) => {
            return role === 'MARKET' ? loginMarket(credentials) : loginUser(credentials)
        },
        onSuccess: (data, variables) => {
            saveSession(data, variables.role)
            toast.success(`Bem-vindo, ${data.name}!`)
            navigate({ to: '/dashboard' })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Erro ao fazer login.'))
        },
    })

    const { mutate: loginWithGoogle, isPending: isLoggingInWithGoogle } = useMutation({
        mutationFn: (idToken: string) => loginGoogleUser({ idToken }),
        onSuccess: (data) => {
            saveSession(data, 'USER')
            toast.success(`Bem-vindo, ${data.name}!`)
            navigate({ to: '/dashboard' })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Erro ao fazer login com Google.'))
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
            clearSession()
            navigate({ to: '/login' })
        },
    })

    return { login, loginWithGoogle, logout, getSession, isLoggingIn, isLoggingInWithGoogle, isLoggingOut }
}
