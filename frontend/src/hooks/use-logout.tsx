// hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logoutApi } from '@/services/auth'
import Cookies from 'js-cookie'

export function useLogout() {
    const navigate = useNavigate()

    function clearSession() {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('marketName')
        Cookies.remove('marketId')
        Cookies.remove('userRole')
    }

    const { mutate: logout, isPending } = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            clearSession()
            toast.success('Você saiu com sucesso!')
            navigate({ to: '/login' })
        },
        onError: () => {
            clearSession()
            navigate({ to: '/login' })
        }
    })

    return { logout, isPending }
}