import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { registerUser } from '@/services/user'
import { registerMarket } from '@/services/supermarket'
import type { RegisterFormData } from '@/components/auth/schemas'
import { getApiStatus } from '@/lib/api-error'

function handleRegisterError(error: unknown) {
    const status = getApiStatus(error)

    if (status === 409 || status === 400) {
        toast.error('Este e-mail ou CNPJ já está cadastrado.')
    } else {
        toast.error('Erro ao realizar o cadastro. Tente novamente.')
    }
    console.error('Erro no cadastro:', error)
}

export function useRegister() {
    const navigate = useNavigate()

    const { mutate: registerMarketMutation, isPending: isPendingMarket } = useMutation({
        mutationFn: registerMarket,
        onSuccess: () => {
            toast.success('Supermercado cadastrado com sucesso!')
            navigate({ to: '/login' })
        },
        onError: handleRegisterError,
    })

    const { mutate: registerUserMutation, isPending: isPendingUser } = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            toast.success('Conta criada com sucesso!')
            navigate({ to: '/login' })
        },
        onError: handleRegisterError,
    })

    function submit(data: RegisterFormData) {
        if (data.role === 'MARKET') {
            registerMarketMutation({
                name: data.marketName || '',
                cnpj: (data.cnpj || '').replace(/\D/g, ''),
                email: data.email,
                password: data.password,
                streetAddress: 'Endereço pendente',
                neighborhood: 'Bairro pendente',
            })
        } else {
            registerUserMutation({
                name: data.name || '',
                email: data.email,
                password: data.password,
            })
        }
    }

    return {
        submit,
        isPending: isPendingMarket || isPendingUser,
    }
}
