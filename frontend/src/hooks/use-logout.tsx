import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { logoutApi } from '@/services/auth'
import { clearSessionState } from '@/utils/session'

export function useLogout() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    function clearSession() {
        clearSessionState()
        queryClient.clear()
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
        },
    })

    return { logout, isPending }
}
